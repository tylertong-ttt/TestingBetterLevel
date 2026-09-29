/* BetterLevel RPG - hướng dẫn người chơi mới. Không cần sửa file này sau khi cài. */
(() => {
  'use strict';
  const DONE_KEY = 'betterlevel_onboarding_done_v1';
  const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg?seed=hero';
  const steps = [
    { title:'Chào mừng đến với BetterLevel RPG!', text:'Đây là bảng điều khiển biến công việc và thói quen ngoài đời thành hành trình nhập vai. Bạn có thể đi từng bước bằng nút Tiếp theo, quay lại bằng Quay lại, hoặc bỏ qua bất cứ lúc nào.', target:'#heroProfileHeader' },
    { title:'Tạo nhân vật của bạn', text:'Đặt tên anh hùng và chọn ảnh đại diện từ máy tính hoặc điện thoại. Ảnh được lưu trên thiết bị này; nên chọn ảnh vừa phải để tránh đầy bộ nhớ trình duyệt.', target:'#heroProfileHeader', setup:true },
    { title:'Nhiệm vụ hằng ngày', text:'Trong mục Nhiệm Vụ, nhập việc cần làm, chọn độ khó và tạo ủy thác. Khi hoàn thành, bạn nhận phần thưởng theo cơ chế của trò chơi.', target:'#tab-tasks', group:'group-quest', tab:'tab-tasks' },
    { title:'Nhân vật và trang bị', text:'Mở mục Chiến Binh để xem cấp độ, chỉ số và trang bị. Túi đồ giúp bạn kiểm tra những vật phẩm đã sở hữu.', target:'#group-hero', group:'group-hero', tab:'tab-character' },
    { title:'Viễn chinh và Boss', text:'Mục Viễn Chinh là nơi khám phá bản đồ, theo dõi thử thách và sử dụng các tính năng chiến đấu có trong game.', target:'#group-battle', group:'group-battle', tab:'tab-map' },
    { title:'Thương hội', text:'Trong Thương Hội, bạn có thể xem cửa hàng, trang bị và các tính năng mua sắm trong trò chơi. Hãy đọc giá và mô tả trước khi xác nhận giao dịch.', target:'#group-market', group:'group-market', tab:'tab-shop' },
    { title:'Lưu tiến trình và bắt đầu!', text:'Tiến trình hiện được lưu trong trình duyệt trên thiết bị này. Hãy dùng tính năng sao lưu/xuất dữ liệu trong mục Hệ Thống định kỳ, đặc biệt trước khi xóa dữ liệu trình duyệt hoặc đổi máy. Chúc bạn lên cấp vui vẻ!', target:'#group-system', group:'group-system', tab:'tab-system-map' }
  ];
  let index = 0;
  let overlay, card, highlighted = null;

  function ensureUI(){
    if(overlay) return;
    overlay=document.createElement('div'); overlay.id='bl-onboarding';
    overlay.innerHTML=`<div class="bl-shade"></div><section class="bl-card" role="dialog" aria-modal="true" aria-labelledby="bl-title"><div class="bl-count"></div><div class="bl-progress"><span></span></div><h2 id="bl-title"></h2><div class="bl-copy"></div><div class="bl-actions"><button class="bl-skip" type="button">Bỏ qua</button><div><button class="bl-back" type="button">Quay lại</button> <button class="bl-next" type="button">Tiếp theo →</button></div></div></section>`;
    document.body.appendChild(overlay); card=overlay.querySelector('.bl-card');
    overlay.querySelector('.bl-next').addEventListener('click', next);
    overlay.querySelector('.bl-back').addEventListener('click', back);
    overlay.querySelector('.bl-skip').addEventListener('click', finish);
    overlay.querySelector('.bl-shade').addEventListener('click', finish);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('bl-open'))finish();});
  }
  function clearSpot(){ if(highlighted) highlighted.classList.remove('bl-spotlight'); highlighted=null; }
  function render(){
    ensureUI(); clearSpot(); const s=steps[index];
    overlay.querySelector('.bl-count').textContent=`Bước ${index+1}/${steps.length}`;
    overlay.querySelector('.bl-progress span').style.width=`${(index+1)/steps.length*100}%`;
    overlay.querySelector('#bl-title').textContent=s.title;
    const copy=overlay.querySelector('.bl-copy'); copy.innerHTML='';
    const p=document.createElement('p'); p.textContent=s.text; copy.appendChild(p);
    if(s.setup){
      const nameLabel=document.createElement('label'); nameLabel.className='bl-field'; nameLabel.textContent='Tên nhân vật';
      const name=document.createElement('input'); name.type='text'; name.maxLength=30; name.placeholder='Ví dụ: Hiệp Sĩ';
      try{name.value=window.BetterLevelProfile?.getState()?.heroName||'';}catch(_){ }
      nameLabel.appendChild(name); copy.appendChild(nameLabel);
      const avatarLabel=document.createElement('label'); avatarLabel.className='bl-field'; avatarLabel.textContent='Chọn ảnh đại diện (không bắt buộc)';
      const file=document.createElement('input'); file.type='file'; file.accept='image/*';
      const preview=document.createElement('img'); preview.className='bl-preview'; preview.alt='Xem trước ảnh'; preview.src=document.getElementById('avatarDisplay')?.src||DEFAULT_AVATAR;
      avatarLabel.append(file,preview); copy.appendChild(avatarLabel);
      file.addEventListener('change',()=>{const f=file.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){alert('Vui lòng chọn tệp hình ảnh.');file.value='';return;}if(f.size>5*1024*1024){alert('Ảnh gốc lớn hơn 5 MB. Hãy chọn ảnh nhỏ hơn.');file.value='';return;}const reader=new FileReader();reader.onload=()=>{preview.src=reader.result;preview.dataset.image=reader.result;};reader.readAsDataURL(f);});
      overlay.querySelector('.bl-next').onclick=()=>{saveProfile(name.value,preview.dataset.image);next();};
    }else overlay.querySelector('.bl-next').onclick=next;
    overlay.querySelector('.bl-back').style.visibility=index===0?'hidden':'visible';
    overlay.querySelector('.bl-next').textContent=index===steps.length-1?'Hoàn tất ✓':'Tiếp theo →';
    const target=s.target?document.querySelector(s.target):null;
    if(target){highlighted=target;target.classList.add('bl-spotlight');target.scrollIntoView({behavior:'smooth',block:'center'});}
  }
  function saveProfile(name,image){
    const data={}; if(name.trim())data.heroName=name.trim(); if(image)data.avatarUrl=image;
    if(Object.keys(data).length&&window.BetterLevelProfile?.updateProfile)window.BetterLevelProfile.updateProfile(data);
    if(image){const img=document.getElementById('avatarDisplay');if(img)img.src=image;}
  }
  function navigate(s){if(!s.group)return;const btn=document.querySelector(`[data-group-tab="${s.group}"]`);if(btn)btn.click();if(s.tab&&s.group!=='group-quest'){const sub=document.querySelector(`[data-subtab="${s.tab}"]`);if(sub)sub.click();}}
  function next(){if(index===steps.length-1){finish();return;}index++;navigate(steps[index]);render();}
  function back(){if(index<=0)return;index--;navigate(steps[index]);render();}
  function finish(){clearSpot();overlay?.classList.remove('bl-open');try{localStorage.setItem(DONE_KEY,'1');}catch(_){} }
  function start(force=false){ensureUI();if(!force&&localStorage.getItem(DONE_KEY)==='1')return;index=0;overlay.classList.add('bl-open');render();}
  window.BetterLevelOnboarding={start,restart:()=>start(true)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>start(false),500));else setTimeout(()=>start(false),500);
})();
