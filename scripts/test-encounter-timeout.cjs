const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');
const ts = require(process.cwd() + '/node_modules/typescript');
const code = ts.transpileModule(fs.readFileSync('src/app/api/encounter/route.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function run(mode) {
  let calls=0;
  const controller=new AbortController();
  const exports={};
  const context={exports, process:{env:{VERCEL:'1',DO_INFERENCE_API_KEY:'test'}}, console:{info(){},warn(){},error(){}}, Date, Set,
    AbortSignal:{timeout(ms){assert.equal(ms,165000);return controller.signal;}},
    require(name){
      if(name==='next/server') return {NextResponse:{json:(body,init)=>({body,status:init?.status||200})}};
      if(name==='@/lib/prompt') return {buildSystemPrompt:()=>'',buildUserPrompt:()=>'',parseEncounterJson:()=>({plant:{}})};
      throw Error('Unexpected import (classifier should be skipped): '+name);
    },
    fetch:async(url,options)=>{calls++;assert.equal(options.signal,controller.signal);
      if(mode==='timeout'){controller.abort();throw Error('aborted');}
      if(mode==='auth')return {ok:false,status:401,text:async()=> 'unauthorized'};
      return {ok:true,json:async()=>({choices:[{message:{content:'{}'}}]})};
    }
  };
  vm.runInNewContext(code,context);
  assert.equal(exports.maxDuration, 180);
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.equal(config.functions['src/app/api/encounter/route.ts'].maxDuration, exports.maxDuration);
  assert.ok(165000 < exports.maxDuration * 1000);
  const result=await exports.POST({json:async()=>({imageDataUrl:'data:image/png;base64,test'})});
  assert.equal(calls,1);
  if(mode==='timeout'){assert.equal(result.status,503);assert.equal(result.body.code,'INFERENCE_TIMEOUT');}
  if(mode==='auth'){assert.equal(result.status,502);assert.equal(result.body.code,'INFERENCE_UNAVAILABLE');}
  if(mode==='success'){assert.equal(result.status,200);assert.equal(result.body.modelUsed,'llama-4-maverick');}
}
(async()=>{for(const mode of ['timeout','auth','success'])await run(mode);console.log('PASS: shared deadline, timeout response, no auth retries, Vercel classifier bypass, vision success');})().catch(e=>{console.error(e);process.exitCode=1;});
