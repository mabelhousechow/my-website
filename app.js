const $ = (s) => document.querySelector(s);
const questions = [
  {title:'最近，想改善哪些方面？',help:'可多选，选出你关心的方向；再次点击可以取消。',multiple:true,exclusive:4,options:['头皮容易出油','发丝干枯毛躁','头皮容易干痒','发缝或掉发变化','想了解日常养护']},
  {title:'这样的感受持续多久了？',help:'单选，凭最近的印象选择就好。',options:['最近才注意到','已经有一段时间','时好时坏，说不准']},
  {title:'最近的生活节奏怎么样？',help:'可多选，比如熬夜和染烫可以同时选择。',multiple:true,exclusive:3,options:['作息比较规律','经常熬夜或压力大','近期染烫或频繁造型','没有特别留意']}
];
let step=0, answers=[[],[],[]], toastTimer, reportText='';
function show(view){for(const id of ['welcome','quiz','result'])$('#'+id).hidden=id!==view;window.scrollTo({top:0,behavior:'instant'});}
function render(){
 const q=questions[step];
 $('#quiz-title').textContent=q.title;$('#question-help').textContent=q.help;
 $('#step-label').textContent=`0${step+1} / 03`;$('#progress-fill').style.width=`${(step+1)/3*100}%`;
 $('#answers').replaceChildren();
 q.options.forEach((label,index)=>{
  const selected=answers[step].includes(index),button=document.createElement('button');
  button.type='button';button.className='answer'+(q.multiple?' multiple':'')+(selected?' selected':'');
  button.setAttribute('aria-pressed',String(selected));
  const mark=document.createElement('span');mark.className='circle';mark.textContent=selected?'✓':'';
  const text=document.createElement('span');text.textContent=label;button.append(mark,text);
  button.onclick=()=>{
   if(!q.multiple)answers[step]=[index];
   else if(selected)answers[step]=answers[step].filter(v=>v!==index);
   else if(index===q.exclusive)answers[step]=[index];
   else answers[step]=[...answers[step].filter(v=>v!==q.exclusive),index].sort((a,b)=>a-b);
   render();$('#answers').children[index].focus({preventScroll:true});
  };$('#answers').append(button);
 });
 $('#next').textContent=step===2?'生成我的养护报告 ↗':'下一题 →';$('#quiz-error').textContent='';
}
function enterQuiz(){show('quiz');render();$('#quiz-title').focus();}
$('#start').onclick=enterQuiz;
$('#back').onclick=()=>{if(step===0)show('welcome');else{step--;enterQuiz();}};
$('#clear-current').onclick=()=>{answers[step]=[];render();$('#answers').firstElementChild.focus();};
$('#next').onclick=()=>{if(!answers[step].length){$('#quiz-error').textContent='请先选择一项，再继续吧。';return;}if(step<2){step++;enterQuiz();}else{makeReport();show('result');$('#report-title').focus();}};
const concerns=[
 {tag:'清爽感待照顾',why:'你选了「头皮容易出油」：这次先关注清洁后的舒适度和出油节奏，不必一味追求强去油。',direction:'头皮侧重清洁后舒适、充分冲洗；护发产品主要放在发中至发尾。'},
 {tag:'柔顺感待照顾',why:'你选了「发丝干枯毛躁」：发尾的柔顺和梳理手感，是比单纯增加洗头次数更值得关注的方向。',direction:'发丝侧重柔顺护理，减少高温、揉搓和拉扯；头皮与发尾分区照顾。'},
 {tag:'舒适感优先',why:'你选了「头皮容易干痒」：先减少刺激、简化步骤，比继续叠加护理更合适；干痒的原因不能靠问卷确定。',direction:'先以温和、简单的洗护为主；若新产品后出现不适，暂停使用并观察，持续不适需咨询皮肤科。'},
 {tag:'关注发缝变化',why:'你选了「发缝或掉发变化」：需要留意变化是否持续，先别把所有原因归到洗发水上。',direction:'日常轻柔清洁、减少紧扎和拉扯；明显或持续掉发应先咨询皮肤科，洗护产品不能代替诊疗。'},
 {tag:'日常平衡养护',why:'你选了「想了解日常养护」：目前没有指定困扰，先找到舒服、容易坚持的洗护节奏。',direction:'从简单稳定的清洁与发尾护理开始，根据实际感受调整，不必一次增加很多产品。'}
];
function makeReport(){
 const has=i=>answers[0].includes(i),life=i=>answers[2].includes(i);
 let verdict,profile,actions,title;
 if(has(2)){
  verdict='总觉得干痒，先让头皮舒服下来。';profile='你更需要先照顾舒适感，再兼顾'+(has(0)?'清爽':'日常清洁')+(has(1)?'与发尾柔顺':'')+'，养护步骤可以先做减法。';
  actions=['今晚洗头用温水、指腹轻洗，别用指甲抓挠，也别反复搓洗。','先暂停新加且让你不舒服的产品，保持简单洗护；若持续干痒、红肿或疼痛，咨询皮肤科。'];title='先温和舒适，再谈其他养护';
 }else if(has(0)&&has(1)){
  verdict='头皮容易油、发尾却干，要分开照顾。';profile='你的清爽需求和柔顺需求同时存在，同一套用法不一定能兼顾头皮与发尾。';
  actions=['清洁重点放在头皮，用指腹轻洗并充分冲净，不反复搓揉发尾。','洗后把护发素按说明用在发中至发尾并冲净，吹风避免高温停留一处。'];title='头皮清爽 + 发尾柔顺，分区养护';
 }else if(has(3)){
  verdict='发缝、掉发有变化，值得认真理一理。';profile='你在意的是变化有没有持续。先理清出现的时间和近期习惯，再决定养护安排。';
  actions=['今天先放松过紧的扎发，梳理时从发尾慢慢解结，减少拉扯。','记下变化从何时开始、是否明显增多；持续掉发或局部稀疏，预约皮肤科咨询。'];title='轻柔日常养护，同时重视持续变化';
 }else if(has(0)){
  verdict='头皮容易油，别把“洗得很涩”当清爽。';profile='你最在意洗后能否舒服清爽，先把清洁方式与洗发节奏理顺。';
  actions=['按实际出油和舒适程度安排洗发，温水轻洗、充分冲净，不用刻意拖延。','今天留意洗后多久开始觉得闷或油，记录运动、戴帽子后的感受，方便调整节奏。'];title='清洁后舒服，是清爽养护的起点';
 }else if(has(1)){
  verdict='发尾干又毛，先少一点高温和拉扯。';profile='你的养护重点在发丝手感，先减少日常摩擦，再给发尾合适的护理。';
  actions=['洗后用毛巾轻按吸水，不来回揉搓，打结处从发尾慢慢梳开。','按说明使用发中至发尾的护发产品，吹风用适宜温度并保持距离。'];title='减少损耗，照顾发尾柔顺';
 }else{
  verdict='没特别困扰，就把舒服的洗护习惯坚持好。';profile='不用为了养护制造焦虑，先认识自己的头皮舒适感和发尾手感。';
  actions=['下一次洗头用温水和指腹轻洗，充分冲洗，感受洗后的舒适度。','今天梳头放轻一点，吹风避免长时间高温，给日常习惯做一点小调整。'];title='简单、稳定、适合自己的日常养护';
 }
 // Keep every concern visible, even when the headline prioritizes comfort.
 const reasons=answers[0].map(i=>concerns[i].why);
 const duration=answers[1][0];
 reasons.push(['你选了「最近才注意到」：先从今天的小调整开始，观察感受是否改变。','你选了「已经有一段时间」：沟通时说明大致开始时间，持续不适别只靠换洗护产品。','你选了「时好时坏，说不准」：可以留意天气、洗护和生活节奏变化，不急着给原因下结论。'][duration]);
 const lifeNotes=['你选了「作息比较规律」：保留这个习惯，把注意力放回实际洗护感受。','你选了「经常熬夜或压力大」：这是沟通养护时值得了解的背景，不能仅凭这一项确定原因。','你选了「近期染烫或频繁造型」：发丝护理时关注高温和反复拉扯，近期可减少额外造型。','你选了「没有特别留意」：不用补做复杂记录，从下一次洗后的感受开始就好。'];
 reasons.push(...answers[2].map(i=>lifeNotes[i]));
 if(life(1)&&!has(2)&&!has(3)&&!has(1))actions[1]='今晚尽量在固定时间休息，给自己留一点放松时间；同时留意下一次洗后的舒适感。';
 $('#report-verdict').textContent=verdict;$('#report-profile').textContent=profile;
 $('#report-date').textContent=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const tags=[answers[0].length>1?'多种需求 · 分区照顾':concerns[answers[0][0]].tag,['近期开始关注','已持续一段时间','状态时有波动'][duration],life(2)?'近期染烫／造型':life(1)?'生活节奏偏紧':life(0)?'作息较规律':'从日常观察开始'];
 $('#report-tags').replaceChildren(...tags.map(t=>{const e=document.createElement('span');e.textContent=t;return e;}));
 $('#report-reasons').replaceChildren(...reasons.map(t=>{const e=document.createElement('p');e.textContent=t;return e;}));
 $('#report-actions').replaceChildren(...actions.map(t=>{const e=document.createElement('li');e.textContent=t;return e;}));
 $('#direction-title').textContent=title;$('#report-direction').textContent=answers[0].map(i=>concerns[i].direction).join(' ');
 $('#wechat-hook').textContent='你刚才提到「'+answers[0].map(i=>questions[0].options[i]).join('、')+'」。把结果发给我们，一起理清适合你的洗护搭配，不用自己反复试。';
 reportText=['我的姜力轻自测结果',verdict,...questions.map((q,i)=>q.title+' '+answers[i].map(v=>q.options[v]).join('、')),'今天的两件事：',...actions,'想领取专属养护方案和洗护体验装。'].join('\n');
}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4000);}
$('#copy-wechat').onclick=async()=>{try{await navigator.clipboard.writeText('18666095939');toast('微信号已复制，打开微信添加朋友，发送「养护方案」。');}catch{toast('请长按微信号 18666095939 复制，再打开微信添加朋友。');}};
$('#copy-result').onclick=async()=>{try{await navigator.clipboard.writeText(reportText);toast('结果已复制，添加微信后粘贴发送给顾问即可。');}catch{toast('暂时无法自动复制，可以截屏保存报告，发给微信顾问。');}};
$('#edit-answers').onclick=()=>{step=0;enterQuiz();};
$('#retry').onclick=()=>{step=0;answers=[[],[],[]];enterQuiz();};
