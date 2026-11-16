const $ = selector => document.querySelector(selector);
const angles = [
  {name:'头顶整体',help:'低头露出头顶，请他人从上方拍摄。尽量拍到头顶完整轮廓，避免强光反射。'},
  {name:'发缝近照',help:'轻轻拨开发缝，靠近一些并等待对焦清楚。若有头皮放大镜头，可选择它拍摄的照片。'},
  {name:'发际线',help:'轻轻拨开额前头发，拍到两侧与额前发际线。保持自然光，不使用美颜或滤镜。'}
];
let current = 0, stream = null, opening = false, requestId = 0, selectionId = 0, timer;
const photos = [null,null,null];
$('#preview-banner').hidden = !new URLSearchParams(location.search).has('preview');
function toast(message) { $('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),3500); }
function stopCamera() {
  requestId++;
  if (stream) stream.getTracks().forEach(track=>track.stop());
  stream=null;opening=false;$('#camera-video').srcObject=null;$('#camera-video').hidden=true;$('#take-photo').hidden=true;$('#open-camera').hidden=false;$('#open-camera').disabled=false;
}
function displayPhoto() {
  const photo=photos[current];
  $('#capture-image').hidden=!photo;
  if(photo) $('#capture-image').src=photo.url;else $('#capture-image').removeAttribute('src');
  $('#camera-placeholder').hidden=!!photo;
}
function render() {
  selectionId++;stopCamera();displayPhoto();
  $('#capture-title').textContent=angles[current].name;$('#capture-help').textContent=angles[current].help;$('#capture-count').textContent=`0${current+1} / 03`;
  $('#capture-next').textContent=current===2?'完成拍摄记录 ✓':'记录这个角度，继续 →';$('#capture-error').textContent='';$('#camera-status').textContent='';$('#deep-file').value='';
  $('#capture-thumbs').replaceChildren();angles.forEach((angle,i)=>{const tag=document.createElement('span');tag.className=photos[i]?'done':'';tag.textContent=(photos[i]?'✓ ':'')+angle.name;$('#capture-thumbs').append(tag);});
}
function switchView(id) {stopCamera();selectionId++;for(const name of ['deep-intro','capture-panel','deep-complete'])$('#'+name).hidden=name!==id;window.scrollTo(0,0);}
$('#begin-deep').onclick=()=>{current=0;switchView('capture-panel');render();$('#capture-title').focus();};
$('#capture-back').onclick=()=>{if(current===0)switchView('deep-intro');else{current--;render();$('#capture-title').focus();}};
$('#open-camera').onclick=async()=>{
  if(opening)return;
  if(!navigator.mediaDevices?.getUserMedia){$('#camera-status').textContent='当前浏览器不支持直接取景，请从相册选择照片。';return;}
  opening=true;const id=++requestId;$('#open-camera').disabled=true;$('#camera-status').textContent='请允许使用相机；也可从相册选择。';
  try {
    const nextStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});
    if(id!==requestId){nextStream.getTracks().forEach(track=>track.stop());return;}
    stream=nextStream;$('#camera-video').srcObject=stream;await $('#camera-video').play();
    if(id!==requestId)return;
    $('#camera-video').hidden=false;$('#capture-image').hidden=true;$('#camera-placeholder').hidden=true;$('#take-photo').hidden=false;$('#open-camera').hidden=true;$('#camera-status').textContent='请保持画面稳定，确认对焦清楚后拍摄。';
  }catch(error){if(id!==requestId)return;stopCamera();displayPhoto();$('#camera-status').textContent='未能打开相机，请检查权限，或从相册选择照片。';}
  finally{if(id===requestId){opening=false;$('#open-camera').disabled=false;}}
};
function savePhoto(blob) {if(photos[current])URL.revokeObjectURL(photos[current].url);photos[current]={url:URL.createObjectURL(blob),blob};render();$('#camera-status').textContent='照片已记录，可重新打开镜头或从相册替换。';}
$('#take-photo').onclick=()=>{
 const video=$('#camera-video');if(!video.videoWidth||!stream){toast('画面尚未准备好，请稍后再拍。');return;}
 const id=current,selection=++selectionId;const canvas=document.createElement('canvas');const scale=Math.min(1,1920/video.videoWidth);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
 canvas.toBlob(blob=>{if(id!==current||selection!==selectionId)return;if(blob)savePhoto(blob);else toast('未能保存，请重新拍摄。');},'image/jpeg',0.9);
};
$('#deep-file').onchange=()=>{
 const file=$('#deep-file').files[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>10*1024*1024){toast('请选择不超过 10MB 的图片。');$('#deep-file').value='';return;}
 const id=current,selection=++selectionId;const url=URL.createObjectURL(file),image=new Image();image.onload=()=>{URL.revokeObjectURL(url);if(id===current&&selection===selectionId)savePhoto(file);};image.onerror=()=>{URL.revokeObjectURL(url);if(id===current&&selection===selectionId)toast('图片无法读取，请选择 JPG 或 PNG 照片。');};image.src=url;
};
$('#capture-next').onclick=()=>{if(!photos[current]){$('#capture-error').textContent='请先拍摄或选择这个角度的照片。';return;}if(current<2){current++;render();$('#capture-title').focus();}else{switchView('deep-complete');$('#collected-photos').replaceChildren();photos.forEach((photo,i)=>{const card=document.createElement('div'),image=document.createElement('img'),title=document.createElement('strong'),download=document.createElement('a');image.src=photo.url;image.alt=angles[i].name+'照片';title.textContent=angles[i].name;download.href=photo.url;download.download=`姜力-${angles[i].name}.${photo.blob.type==='image/png'?'png':photo.blob.type==='image/jpeg'?'jpg':'image'}`;download.textContent='下载照片 ↓';card.append(image,title,download);$('#collected-photos').append(card);});$('#complete-title').focus();}};
async function copy(text){try{await navigator.clipboard.writeText(text);toast('已复制，打开微信发送即可。');}catch{toast('复制未成功，请长按文字手动复制。');}}
$('#deep-copy-wechat').onclick=()=>copy('18666095939');
$('#copy-record').onclick=()=>copy('我想做深度测评，已记录头顶整体、发缝近照和发际线三个角度。\n补充感受：'+($('#deep-notes').value.trim()||'暂无')+'\n照片将另行发送，请告知进一步测评方式。');
$('#deep-restart').onclick=()=>{current=0;switchView('capture-panel');render();$('#capture-title').focus();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopCamera();displayPhoto();}});
window.addEventListener('pagehide',()=>stopCamera());
window.addEventListener('beforeunload',()=>{stopCamera();photos.forEach(photo=>{if(photo)URL.revokeObjectURL(photo.url);});});
