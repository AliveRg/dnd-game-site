import numpy as np
from PIL import Image, ImageFilter, ImageDraw
rng=np.random.default_rng(11)
A=Image.open('/tmp/mp/A.png').convert('RGB'); B=Image.open('/tmp/mp/B.png').convert('RGB')
C0=40; C1=984; S=C1-C0         # обрезка рамки у B
W,H=1420,S
SEA=np.array([111,151,141],float)

def sea(w,h):
    yy,xx=np.mgrid[0:h,0:w]
    low=np.asarray(Image.fromarray((rng.random((h//64+2,w//64+2))*255).astype('uint8')).resize((w,h),Image.BICUBIC)).astype(float)/255-.5
    mid=np.asarray(Image.fromarray((rng.random((h//12+2,w//12+2))*255).astype('uint8')).resize((w,h),Image.BICUBIC)).astype(float)/255-.5
    fine=rng.normal(0,1.6,(h,w))
    a=SEA[None,None,:]+ (low*14+mid*5+fine)[...,None]*np.array([0.9,1,0.95])
    return a
canvas=sea(W,H)
# B
b=np.asarray(B.crop((C0,C0,C1,C1))).astype(float)
mask=np.ones((S,S))
# затираем угловые завитки рамки морем
yy,xx=np.mgrid[0:S,0:S]
for cx,cy in [(0,0),(S,0),(0,S),(S,S)]:
    d=np.sqrt((xx-cx)**2+(yy-cy)**2); mask=np.minimum(mask,np.clip((d-70)/40,0,1))
# мягкий правый край B, чтобы перейти в новое море
mask=np.minimum(mask,np.clip((S-xx)/50,0,1)*0+1)
edge=np.clip((S-6-xx)/40,0,1)
mask=np.minimum(mask,np.where(xx>S-60,edge,1))
canvas[:, :S]=canvas[:, :S]*(1-mask[...,None])+b*mask[...,None]

def paste(src, box, dst, shape='ellipse', feather=28, pad=0.0):
    x0,y0,x1,y1=box; w,h=x1-x0,y1-y0
    piece=np.asarray(src.crop(box)).astype(float)
    m=Image.new('L',(w,h),0); d=ImageDraw.Draw(m)
    if shape=='ellipse': d.ellipse((feather,feather,w-feather,h-feather),fill=255)
    else: d.rounded_rectangle((feather,feather,w-feather,h-feather),radius=min(w,h)//3,fill=255)
    m=np.asarray(m.filter(ImageFilter.GaussianBlur(feather*0.6))).astype(float)/255
    X,Y=dst
    reg=canvas[Y:Y+h, X:X+w]
    canvas[Y:Y+h, X:X+w]=reg*(1-m[...,None])+piece*m[...,None]

# куски из A (координаты A в исходных пикселях) → правая часть моря
paste(A,(640,80,880,330),(1040,30))                  # колизей → Бастион
paste(A,(650,270,1010,440),(1010,330),feather=30)    # токсичное озеро, лаборатории → Налянск
paste(A,(370,740,660,960),(1080,580),feather=30)     # лагерь с кострами → Месть Гоблинов
paste(A,(175,200,290,300),(980,830),feather=22)      # кораблик (декор)
# лёгкая виньетка по краям
yy,xx=np.mgrid[0:H,0:W]
v=np.clip(1-((np.maximum(0,np.abs(xx-W/2)-W/2+120)/120)**2+(np.maximum(0,np.abs(yy-H/2)-H/2+120)/120)**2)*0.35,0.65,1)
canvas*=v[...,None]
out=Image.fromarray(np.clip(canvas,0,255).astype('uint8'))
out.save('/tmp/mp/world.png')
out.save('/home/claude/dnd-site/public/images/world-map-v2.webp',quality=78,method=6)
print(out.size)
