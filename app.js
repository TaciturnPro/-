const KEY='wlfx_v2',DAY=864e5;
let DB=(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{v:2,q:{}}}catch(e){return{v:2,q:{}}}})();
if(!DB.q)DB.q={};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){alert('存储失败,空间可能已满')}};
const REASONS=['概念','公式','条件','计算'];
const RLABEL={概念:'概念记错',公式:'公式用错',条件:'条件漏看',计算:'计算失误'};
const rec=id=>DB.q[id]||(DB.q[id]={att:0,cor:0,streak:0,wrong:false,reason:'',due:0,snap:null});
const wrongAll=()=>Object.keys(DB.q).filter(k=>DB.q[k].wrong&&DB.q[k].snap);
const dueAll=()=>wrongAll().filter(k=>DB.q[k].due<=Date.now());
const L=i=>'ABCD'[i];
const ansStr=s=>(s.m?s.a:[s.a]).map(L).join('');

const TOPICS=[
 {f:'t1.html',n:'专题一 · 力学概念精度',d:'常驻错项 / 矢量性 / 图像 / 动态平衡 / 曲线圆周 / 功能动量 · 24 题'},
 {f:'',n:'专题二 · 近代物理与热学记忆精度',d:'核反应方程 / 比结合能 / 光电效应 / 分子力与内能 · 编写中'},
 {f:'',n:'专题三 · 万有引力与简谐运动',d:'黄金代换 / 同步卫星 / 位置函数对称性 · 待开始'}
];

/* ========== 首页 ========== */
function homeRender(app){
  const w=wrongAll().length,d=dueAll().length,att=Object.keys(DB.q).length;
  app.innerHTML=`<div class="card"><div class="ct">今日状态<span class="pct">练过 ${att} 题</span></div>
   <p class="n" style="margin-top:6px">错题 ${w} 道,今日到期需复习 ${d} 道。</p>
   ${d?'<div class="f">到期错题会在专题页"只刷错题"里优先出现。</div>':''}</div>`
  +TOPICS.map(t=>t.f?`<a class="entry" href="${t.f}"><div class="en">${t.n}</div><div class="ed">${t.d}</div></a>`
    :`<div class="entry soon"><div class="en">${t.n}</div><div class="ed">${t.d}</div></div>`).join('')
  +`<div class="card"><div class="ct">怎么用</div>
   <p class="n" style="margin-top:6px">题目都是四选项跨章节辨析,先点选项,再点确定提交才判分。解析逐项点评,重点看错项错在哪个字。多选题选对但不全算半对,仍进错题本。</p></div>`;
}

/* ========== 错题本 ========== */
function wrongRender(app){
  const all=wrongAll(),cnt={};
  REASONS.forEach(x=>cnt[x]=all.filter(k=>DB.q[k].reason===x).length);
  const tot=all.length||1;
  app.innerHTML=`<div class="card"><div class="ct">错题 ${all.length} 道<span class="pct">今日待复习 ${dueAll().length}</span></div>
   ${all.length?`<div style="margin-top:10px">${REASONS.map(x=>
     `<div style="margin:6px 0"><div class="n">${RLABEL[x]} · ${cnt[x]} 道 (${Math.round(cnt[x]/tot*100)}%)</div>
      <div class="bar"><i style="width:${cnt[x]/tot*100}%"></i></div></div>`).join('')}
     <div class="n" style="margin-top:10px">占比最高的那一类就是你丢分的真正原因。</div></div>`:''}</div>`
  +(all.length?all.map(k=>{const r=DB.q[k],s=r.snap,d=Math.ceil((r.due-Date.now())/DAY);
     return `<div class="card"><div class="n"><span class="tag">${RLABEL[r.reason]||'未分类'}</span>
      <span class="tag">${s.g}</span>错 ${r.att-r.cor} 次 · ${r.due<=Date.now()?'待复习':d+' 天后复习'}</div>
      <div class="q">${s.m?'(多选) ':''}${s.t}</div>
      ${s.o.map((o,i)=>`<div class="opt">${L(i)}. ${o}</div>`).join('')}
      <div class="f good">正确答案 ${ansStr(s)}</div>
      <div style="font-size:14.5px;color:#aeb6c2">${s.e}</div>
      <button class="mini" onclick="rmWrong('${k}')">手动移出</button></div>`}).join('')
   :'<div class="empty">还没有错题。答错的题会自动收进来,按错误原因分四类统计。</div>');
}
window.rmWrong=k=>{DB.q[k].wrong=false;save();location.reload()};

/* ========== 速查 ========== */
function refRender(app){
 app.innerHTML=`<div class="card"><div class="ct">一、用词精度(最高频失分点)</div><table>
 <tr><td>相同</td><td>矢量:大小和方向都一样。位移相同、Δv 相同、动量相同都按这条判。</td></tr>
 <tr><td>相等</td><td>只比大小,不管方向。弹力相等、速率相等、动能相等。</td></tr>
 <tr><td>一定 / 可能</td><td>"一定"有一个反例就错;"可能"有一个例子就对。</td></tr>
 <tr><td>不变</td><td>矢量不变 = 大小方向都不变。匀速圆周速度在变,速率不变。</td></tr>
 <tr><td>变化量 Δ</td><td>末减初,矢量差。与"变化率"(除以时间)不是一回事。</td></tr>
 <tr><td>缓慢</td><td>每一时刻都是平衡态,按静力学处理。</td></tr>
 <tr><td>恰好 / 刚好</td><td>临界条件,某个量正好为 0 或正好达极值。</td></tr>
 <tr><td>第 n 秒内</td><td>时长 1 s 的那一段,不是前 n 秒。</td></tr></table></div>
 <div class="card"><div class="ct">二、常驻错项</div><table>
 <tr><td>惯性</td><td>只由质量决定,与速度、受力、状态全无关。</td></tr>
 <tr><td>牛顿第三定律</td><td>任何情况都成立,等大反向同性质,作用在两物体上不能求合力。</td></tr>
 <tr><td>质点</td><td>取决于所研究的问题,不取决于物体大小。研究转动不能当质点。</td></tr>
 <tr><td>向心力</td><td>按效果命名,是已有力的合力或分力,不是额外的力。没有"离心力"。</td></tr>
 <tr><td>恒力</td><td>能做曲线运动(平抛),不能做匀速圆周(方向需持续改变)。</td></tr>
 <tr><td>图线形状</td><td>x-t、v-t 图线不是轨迹,只描述直线运动。</td></tr></table></div>
 <div class="card"><div class="ct">三、函数依赖关系</div><table>
 <tr><td>简谐运动</td><td>位移、加速度、回复力由<b>位置</b>决定且共线;速度大小由位置决定,方向不由位置决定。</td></tr>
 <tr><td>光电效应</td><td>饱和电流 ← 光子数(光强);遏止电压与最大初动能 ← 频率。两条线不能串。</td></tr>
 <tr><td>核反应</td><td>质量数与电荷数守恒是唯一硬标准。铀 235 裂变方程左边必须写入射中子。</td></tr>
 <tr><td>比结合能</td><td>中等质量核最大(铁附近),中间高两头低。核反应朝比结合能变大方向放能。</td></tr>
 <tr><td>每核子释能</td><td>聚变 &gt; 裂变,方向别记反。</td></tr>
 <tr><td>温度</td><td>分子平均<b>动能</b>的标志,不是平均速率,与分子数无关。</td></tr></table></div>
 <div class="card"><div class="ct">四、条件边界</div><table>
 <tr><td>v̄=(v<sub>0</sub>+v)/2</td><td>只在匀变速直线运动成立。</td></tr>
 <tr><td>Δx=aT²</td><td>只在匀变速、连续相等时间间隔下成立。</td></tr>
 <tr><td>动量守恒</td><td>合外力为零;某方向合外力为零则该方向守恒;内力远大于外力可近似守恒。</td></tr>
 <tr><td>机械能守恒</td><td>只有重力或弹力做功。动量守恒不保证机械能守恒。</td></tr>
 <tr><td>摩擦生热</td><td>Q = 滑动摩擦力 × <b>相对位移</b>,不是某物体的位移。</td></tr>
 <tr><td>绳 / 杆临界</td><td>竖直面最高点:绳或轨道内侧最小速度 √(gR);杆或管道可以为零。</td></tr></table></div>`;
}

/* ========== 备份 ========== */
function dataRender(app){
  const n=Object.keys(DB.q).length,w=wrongAll().length;
  app.innerHTML=`<div class="card warn">iPhone 两件事:<br>
   1. 先用 Safari 分享菜单"添加到主屏幕",之后<b>只从图标进入</b>。Safari 里和图标里的数据是两套。<br>
   2. Safari 约 7 天不访问会清理数据,每周导出一次存到"文件"App。</div>
  <div class="card"><div class="ct">当前数据</div><p class="n">练过 ${n} 题 · 错题 ${w} 道</p>
   <button class="btn mid" onclick="expData()">导出备份(下载 JSON)</button>
   <button class="btn mid" onclick="cpData()">复制备份到剪贴板</button></div>
  <div class="card"><div class="ct">导入</div><p class="n">粘贴之前导出的内容,会覆盖当前数据。</p>
   <textarea id="imp" placeholder="在此粘贴备份 JSON"></textarea>
   <button class="btn mid" onclick="impData()">导入并覆盖</button></div>
  <div class="card"><div class="ct">清空</div>
   <button class="btn mid" style="color:#ff9b9b" onclick="clrData()">清空全部记录</button></div>`;
}
window.expData=()=>{const b=new Blob([JSON.stringify(DB)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download='物理备份_'+new Date().toISOString().slice(0,10)+'.json';a.click()};
window.cpData=()=>{const t=JSON.stringify(DB);
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>alert('已复制'))
  .catch(()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);
   a.select();document.execCommand('copy');a.remove();alert('已复制')})};
window.impData=()=>{const v=document.getElementById('imp').value.trim();if(!v)return;
  try{const o=JSON.parse(v);if(!o.q)throw 0;DB=o;save();alert('导入成功');location.reload()}
  catch(e){alert('格式不对,请检查内容是否完整')}};
window.clrData=()=>{if(confirm('确定清空?不可恢复,建议先导出。')){DB={v:2,q:{}};save();location.reload()}};

/* ========== 专题页引擎 ========== */
let T=null,app=null,tab='learn',queue=[],qi=0,mode='all',modeG='',answered=false,sel=[];
function initTopic(t){
  T=t;app=document.getElementById('app');
  document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{
    tab=b.dataset.t;
    document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));
    window.scrollTo(0,0);draw()});
  draw();
}
function draw(){({learn:tLearn,quiz:tQuiz,wrong:()=>wrongRender(app),data:()=>dataRender(app)}[tab])()}

function gStat(gid){const qs=T.qs.filter(q=>q.g===gid);let a=0,c=0;
  qs.forEach(q=>{const r=DB.q[q.id];if(r){a+=r.att;c+=r.cor}});return{a,c,n:qs.length}}

function tLearn(){
  app.innerHTML=T.groups.map(g=>{const s=gStat(g.id),p=s.a?Math.round(s.c/s.a*100):-1;
   return `<div class="card"><button class="ct" onclick="tg('${g.id}')"><span>${g.n}</span>
    <span class="pct">${p<0?'未练':'掌握 '+p+'%'} ›</span></button>
    <div class="body" id="b_${g.id}">${g.b}
    ${s.n?`<button class="mini on" style="margin-top:14px" onclick="startG('${g.id}')">练这组(${s.n} 题)</button>`:''}
    </div></div>`}).join('')
  +`<div class="card"><div class="n">共 ${T.groups.length} 组 · ${T.qs.length} 题。讲解看完立刻练,别积累"看懂了"的错觉。</div></div>`;
}
window.tg=id=>document.getElementById('b_'+id).classList.toggle('on');
window.startG=g=>{mode='g';modeG=g;build();tab='quiz';
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x.dataset.t==='quiz'));
  window.scrollTo(0,0);draw()};

function build(){
  let l=mode==='all'?T.qs.slice():mode==='g'?T.qs.filter(q=>q.g===modeG)
    :mode==='w'?T.qs.filter(q=>DB.q[q.id]&&DB.q[q.id].wrong)
    :T.qs.filter(q=>DB.q[q.id]&&DB.q[q.id].wrong&&DB.q[q.id].due<=Date.now());
  for(let i=l.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[l[i],l[j]]=[l[j],l[i]]}
  queue=l;qi=0;answered=false;sel=[];
}
function tQuiz(){
  if(!queue.length)build();
  const wn=T.qs.filter(q=>DB.q[q.id]&&DB.q[q.id].wrong).length;
  const dn=T.qs.filter(q=>DB.q[q.id]&&DB.q[q.id].wrong&&DB.q[q.id].due<=Date.now()).length;
  const bar=`<div class="card">
   ${[['all','全部'],['g','按组'],['w','只刷错题('+wn+')'],['due','今日复习('+dn+')']].map(([m,n])=>
    `<button class="mini ${mode===m?'on':''}" onclick="setMode('${m}')">${n}</button>`).join('')}
   ${mode==='g'?`<div style="margin-top:8px">${T.groups.map(g=>
    `<button class="mini ${modeG===g.id?'on':''}" onclick="setG('${g.id}')">${g.s}</button>`).join('')}</div>`:''}</div>`;
  if(!queue.length){app.innerHTML=bar+`<div class="empty">${mode==='w'?'本专题还没有错题。':mode==='due'?'今天没有到期的错题。':'没有题目。'}</div>`;return}
  const q=queue[qi],r=rec(q.id),g=T.groups.find(x=>x.id===q.g);
  app.innerHTML=bar+`<div class="card">
   <div class="n">第 ${qi+1} / ${queue.length} 题 <span class="tag">${g.s}</span>
    ${q.m?'<span class="tag" style="color:#ffc46b">多选</span>':''}${r.wrong?'<span class="tag" style="color:#ff9b9b">错题</span>':''}</div>
   <div class="bar"><i style="width:${qi/queue.length*100}%"></i></div>
   <div class="q">${q.t}</div>
   <div id="opts">${q.o.map((o,i)=>`<button class="btn" onclick="pick(${i})">${L(i)}. ${o}</button>`).join('')}</div>
   <button class="btn mid" id="sb" style="color:#79818f" onclick="sub()">请先选择答案</button>
   <div class="exp" id="exp"></div><div id="nx"></div></div>`;
  answered=false;sel=[];
}
window.setMode=m=>{mode=m;if(m==='g'&&!modeG)modeG=T.groups[0].id;build();draw()};
window.setG=g=>{modeG=g;build();draw()};
window.pick=i=>{
  if(answered)return;const q=queue[qi];
  if(q.m){sel.includes(i)?sel.splice(sel.indexOf(i),1):sel.push(i)}else{sel=[i]}
  document.querySelectorAll('#opts .btn').forEach((b,k)=>b.classList.toggle('sel',sel.includes(k)));
  const s=document.getElementById('sb');
  if(!sel.length){s.textContent='请先选择答案';s.style.background='';s.style.borderColor='';s.style.color='#79818f';return}
  s.textContent='确定提交 · 已选 '+sel.slice().sort().map(L).join('');
  s.style.background='#2d5bbd';s.style.borderColor='#2d5bbd';s.style.color='#e6e8ec';
};
window.sub=()=>{if(answered||!sel.length)return;
  answered=true;
  const q=queue[qi],r=rec(q.id),right=q.m?q.a.slice():[q.a];
  r.snap={t:q.t,o:q.o,a:q.a,m:!!q.m,g:T.groups.find(x=>x.id===q.g).s,e:q.e};
  const picked=sel.slice().sort((x,y)=>x-y),rs=right.slice().sort((x,y)=>x-y);
  const noWrong=picked.every(i=>rs.includes(i));
  const full=noWrong&&picked.length===rs.length;
  r.att++;
  document.querySelectorAll('#opts .btn').forEach((b,k)=>{
    if(rs.includes(k))b.classList.add('c');else if(picked.includes(k))b.classList.add('w');else b.classList.add('dim')});
  document.getElementById('sb').style.display='none';
  let extra='';
  if(full){r.cor++;r.streak++;
    if(r.wrong){if(r.streak>=2){r.wrong=false;r.reason='';extra='<div class="f good">连续答对 2 次,已移出错题本。</div>'}
      else{r.due=Date.now()+3*DAY;extra='<div class="f">答对 1 次,再对 1 次移出错题本。</div>'}}
  }else{r.streak=0;r.wrong=true;r.due=Date.now()+DAY;if(!r.reason)r.reason=q.r||'概念';
    extra=`<div style="margin-top:10px"><div class="n">这题错在哪?点一下归类(默认 ${RLABEL[q.r||'概念']})</div>
     ${REASONS.map(x=>`<button class="mini ${r.reason===x?'on':''}" onclick="setR('${q.id}','${x}',this)">${RLABEL[x]}</button>`).join('')}</div>`}
  save();
  const e=document.getElementById('exp');e.className='exp on';
  const head=full?'<b style="color:#6fe0a0">完全正确</b>':(noWrong&&q.m?'<b style="color:#ffc46b">选对但不全(按 3 分计,仍进错题本)</b>':'<b style="color:#ff9b9b">错误</b>');
  e.innerHTML=`${head} · 正确答案 ${rs.map(L).join('')}<div style="margin-top:8px">${q.e}</div>${extra}`;
  document.getElementById('nx').innerHTML=`<button class="btn go" onclick="next()">${qi+1<queue.length?'下一题':'完成本轮'}</button>`;
};
window.setR=(id,x,el)=>{rec(id).reason=x;save();
  el.parentNode.querySelectorAll('.mini').forEach(b=>b.classList.toggle('on',b===el))};
window.next=()=>{if(qi+1<queue.length){qi++;draw();window.scrollTo(0,0)}
  else{app.innerHTML=`<div class="card"><div class="ct">本轮完成</div>
   <p class="n" style="margin-top:10px">共 ${queue.length} 题。错题已进错题本,明天出现在"今日复习"。</p>
   <button class="btn go" onclick="build();draw()">再来一轮</button></div>`}};
