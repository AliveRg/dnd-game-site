// Test-only loader for Nitro source files whose extensionless imports are normally resolved by its bundler.
export async function resolve(specifier,context,next){
 try{return await next(specifier,context)}catch(error){if(specifier.startsWith('.')&&!/\.[cm]?[jt]s$/.test(specifier))return next(specifier+'.ts',context);throw error}
}
