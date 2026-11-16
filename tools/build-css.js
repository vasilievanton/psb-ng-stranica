// Сборка стилей для старых браузеров (Internet Explorer 11 не понимает CSS-переменные).
// Берет исходники из css-src/, перед каждой строкой с var(--...) вставляет строку
// с готовым значением из :root (десктопные значения) и кладет результат в assets/css/.
// Современные браузеры читают вторую строку (с переменной), IE — первую.
// Запуск из корня проекта: node tools/build-css.js
const fs=require('fs'),path=require('path'),postcss=require('postcss');
const root=process.argv[2]||process.cwd();
const src=path.join(root,'css-src'),out=path.join(root,'assets/css');
const vars={};
postcss.parse(fs.readFileSync(path.join(src,'base.css'),'utf8')).walkRules(r=>{
  if(r.selector===':root'&&!(r.parent&&r.parent.type==='atrule')) r.walkDecls(d=>{if(d.prop.startsWith('--'))vars[d.prop]=d.value.trim()});
});
const resolve=v=>{let n=0;while(/var\(--/.test(v)&&n++<10)v=v.replace(/var\((--[\w-]+)(?:,([^)]*))?\)/g,(m,k,f)=>vars[k]!==undefined?vars[k]:(f||m).trim());return v};
for(const f of fs.readdirSync(src).filter(f=>f.endsWith('.css'))){
  const css=postcss.parse(fs.readFileSync(path.join(src,f),'utf8'));
  css.walkDecls(d=>{
    if(d.prop.startsWith('--')||!/var\(--/.test(d.value))return;
    const prev=d.prev();
    if(prev&&prev.type==='decl'&&prev.prop===d.prop&&!/var\(/.test(prev.value))return; // уже есть запасное значение
    d.cloneBefore({value:resolve(d.value)});
  });
  fs.writeFileSync(path.join(out,f),'/* Файл собран из css-src/'+f+' скриптом tools/build-css.js — правьте исходник, а не этот файл. */\n'+css.toString());
}
console.log('ok',Object.keys(vars).length,'vars');
