const $ = (s) => document.querySelector(s);
const questions = [
  {title:'最近，最想改善哪一点？',help:'选一个你最关心的方向。',options:['头皮容易出油','发丝干枯毛躁','头皮容易干痒','发缝或掉发变化','想了解日常养护']},
  {title:'这样的感受持续多久了？',help:'凭最近的印象选择就好。',options:['最近才注意到','已经有一段时间','时好时坏，说不准']},
  {title:'最近的生活节奏怎么样？',help:'这一题帮你找到一个容易开始的小习惯。',options:['作息比较规律','经常熬夜或压力大','近期染烫或频繁造型','没有特别留意']}
];
let step=0, answers=[null,null,null], photoUrl=null, toastTimer;
function show(view){for(const id of ['welcome','quiz','result'])$('#'+id).hidden=id!==view; window.scrollTo({top:0,behavior:'instant'});}
function render(){const q=questions[step];$('#quiz-title').textContent=q.title;$('#question-help').textContent=q.help;$('#step-label').textContent=`0${step+1} / 03`;$('#progress-fill').style.width=`${(step+1)/3*100}%`;$('#answers').replaceChildren();q.options.forEach((label,index)=>{const button=document.createElement('button');button.type='button';button.className='answer'+(answers[step]===index?' selected':'');button.setAttribute('aria-pressed',String(answers[step]===index));const circle=document.createElement('span');circle.className='circle';circle.textContent=answers[step]===index?'✓':'';const text=document.createElement('span');text.textContent=label;button.append(circle,text);button.onclick=()=>{answers[step]=index;render();};$('#answers').append(button);});$('#optional').hidden=step!==2;$('#next').replaceChildren(document.createTextNode(step===2?'查看我的初步报告':'下一题'));const arrow=document.createElement('span');arrow.textContent=step===2?'↗':'→';$('#next').append(arrow);$('#quiz-error').textContent='';}
$('#start').onclick=()=>{show('quiz');render();$('#quiz-title').focus();};
$('#back').onclick=()=>{if(step===0)show('welcome');else{step--;render();$('#quiz-title').focus();}};
$('#next').onclick=()=>{if(answers[step]===null){$('#quiz-error').textContent='选一个最接近你的感受，再继续吧。';return;}if(step<2){step++;render();$('#quiz-title').focus();}else{makeReport();show('result');$('#report-title').focus();}};
const reports=[
 {type:'头皮清爽感养护',observation:'你提到头皮容易出油。清爽感会受到天气、运动、洗护习惯等因素影响，可以先从记录洗后多久开始觉得油腻或闷入手。',advice:'根据实际出油与舒适程度安排洗发，温水轻柔清洁头皮；护发素以发中至发尾为主，充分冲洗。',followup:'留意洗后清爽感能维持多久，以及运动、戴帽子之后的变化。'},
 {type:'发丝柔顺度养护',observation:'你目前更关注干枯和毛躁。发尾手感、打结频率以及染烫和吹风习惯，可以帮助你更具体地描述发丝状态。',advice:'洗后用毛巾轻按吸水，减少用力揉搓；吹风时保持适当距离，避免长时间高温停留在同一区域。',followup:'留意发尾打结、梳理阻力和造型后的手感，观察简单护理带来的变化。'},
 {type:'头皮舒适度养护',observation:'你提到头皮容易干痒。仅凭感受还不能确定原因，可以先留意不适出现的时间，以及近期是否更换了洗护产品。',advice:'先保持洗护步骤简单，避免用指甲抓挠和过热的水；若新产品使用后出现不适，可暂停并观察。',followup:'记录干痒出现的频率、是否伴随红肿或头屑；持续或加重时及时咨询皮肤科。'},
 {type:'发缝与掉发变化记录',observation:'你更关注发缝或掉发变化。单次观察容易受拍摄光线、分缝和洗发间隔影响，暂时不必给自己下结论。',advice:'在相近光线、相同角度下记录头顶状态，避免过紧扎发和反复拉扯；若近期明显增多或出现局部稀疏，建议咨询皮肤科。',followup:'留意变化出现的时间及是否持续，结合近期作息、身体状态和洗护习惯一起记录。'},
 {type:'日常平衡养护',observation:'你想更了解日常养护。可以先从头皮洗后的舒适程度、发尾的手感，以及适合自己的洗护间隔开始观察。',advice:'先保持简单稳定的洗护习惯，轻柔清洁、充分冲洗，再根据自己的真实感受逐步调整。',followup:'不用追求每天完全相同的状态，留意一段时间里的舒适感和发丝手感就好。'}
];
function makeReport(){const r=reports[answers[0]];$('#report-type').textContent=r.type;$('#report-date').textContent=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());$('#report-observation').textContent=r.observation+(answers[1]===1?' 你也提到已经持续一段时间，后续沟通时可以说明大致开始时间。':'');$('#report-advice').textContent=r.advice+(answers[2]===1?' 生活节奏较紧张时，也可以从尽量固定入睡时间开始。':answers[2]===2?' 近期有染烫或造型时，尽量给发丝留出休息的时间。':'');$('#report-followup').textContent=r.followup;$('#report-tags').replaceChildren();questions.forEach((q,i)=>{const tag=document.createElement('span');tag.textContent=q.options[answers[i]];$('#report-tags').append(tag);});const notes=$('#notes').value.trim();$('#report-note').hidden=!notes;$('#report-note').textContent='你的补充记录：'+notes;$('#report-photo-wrap').hidden=!photoUrl;if(photoUrl)$('#report-photo').src=photoUrl;else $('#report-photo').removeAttribute('src');}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
$('#photo').onchange=()=>{const file=$('#photo').files[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>10*1024*1024){toast('请选择不超过 10MB 的图片。');$('#photo').value='';return;}const candidate=URL.createObjectURL(file);const img=new Image();img.onload=()=>{if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=candidate;$('#photo-preview').src=photoUrl;$('#photo-wrap').hidden=false;};img.onerror=()=>{URL.revokeObjectURL(candidate);$('#photo').value='';toast('这张图片无法预览，请换一张 JPG 或 PNG 照片。');};img.src=candidate;};
$('#remove-photo').onclick=()=>{if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=null;$('#photo').value='';$('#photo-preview').removeAttribute('src');$('#photo-wrap').hidden=true;};
$('#copy-wechat').onclick=async()=>{try{await navigator.clipboard.writeText('18666095939');toast('微信号已复制，打开微信添加朋友即可。');}catch{toast('请长按微信号 18666095939 复制，再去微信添加。');}};
$('#retry').onclick=()=>{step=0;answers=[null,null,null];show('quiz');render();$('#quiz-title').focus();};
window.addEventListener('beforeunload',()=>{if(photoUrl)URL.revokeObjectURL(photoUrl);});
