import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url)),publicRoot=path.join(root,'public');
const catalog=JSON.parse(await fs.readFile(path.join(publicRoot,'versions.json'),'utf8'));
assert.equal(catalog.name,'site-commenter');assert(catalog.versions.length>0);
assert.equal(new Set(catalog.versions).size,catalog.versions.length);
const expected=['.nojekyll','index.html','versions.json',...catalog.versions].sort();
assert.deepEqual((await fs.readdir(publicRoot)).sort(),expected);
for(const version of catalog.versions){
 assert.match(version,/^v\d+\.\d+\.\d+$/);
 const release=path.join(publicRoot,version);
 assert.deepEqual((await fs.readdir(release)).sort(),['THIRD_PARTY_NOTICES.txt','manifest.json','site-commenter.min.js']);
 const manifest=JSON.parse(await fs.readFile(path.join(release,'manifest.json'),'utf8'));
 assert.equal(manifest.name,'site-commenter');assert.equal('v'+manifest.version,version);
 assert.deepEqual(Object.keys(manifest.files).sort(),['THIRD_PARTY_NOTICES.txt','site-commenter.min.js']);
 for(const [file,info] of Object.entries(manifest.files)){
  const data=await fs.readFile(path.join(release,file));assert.equal(data.length,info.bytes);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),info.sha256);
  assert.equal('sha384-'+crypto.createHash('sha384').update(data).digest('base64'),info.integrity);
 }
 const js=await fs.readFile(path.join(release,'site-commenter.min.js'),'utf8');
 assert(!/sourceMappingURL=|script\.google\.com\/macros\/s\//.test(js),'Public bundle must omit debugging sources and site endpoints');
}
// Existing version directories cannot be changed or deleted in an update.
let parent;try{parent=execFileSync('git',['rev-parse','--verify','HEAD^'],{cwd:root,stdio:['ignore','pipe','ignore'],encoding:'utf8'}).trim();}catch{}
if(parent){
 const previous=execFileSync('git',['ls-tree','--name-only',parent+':public'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(v=>/^v\d+\.\d+\.\d+$/.test(v));
 for(const version of previous){assert(catalog.versions.includes(version),'Cannot remove '+version);assert.equal(execFileSync('git',['diff','--name-only',parent,'--','public/'+version],{cwd:root,encoding:'utf8'}).trim(),'','Cannot modify '+version);}
}
console.log('All '+catalog.versions.length+' release(s) passed integrity, public-file allowlist and immutable-version checks.');
