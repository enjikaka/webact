const data = await Deno.readTextFile('package.json');
const json = JSON.parse(data);

const entry = './index.js';

json.exports =  {};
json.exports.import = entry;
json.browser = entry;
json.type = 'module';
json.module = entry;
json.types = './index.d.ts';

delete json.scripts;
delete json.type;

await Deno.writeTextFile('pkg/package.json', JSON.stringify(json, null , 2));
