const data = await Deno.readTextFile('package.json');
const json = JSON.parse(data);

const entry = './index.js';

json.exports =  {};
json.exports['.'] = entry;
json.browser = entry;

json.type = 'module';

json.types = './index.d.ts';

if ('scripts' in json) {
  delete json.scripts;
}

await Deno.writeTextFile('pkg/package.json', JSON.stringify(json, null , 2));
