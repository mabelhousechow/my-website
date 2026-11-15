const photoInput = document.querySelector('#photo-input');
const uploadBox = document.querySelector('#upload-box');
const uploadPlaceholder = document.querySelector('#upload-placeholder');
const uploadPreview = document.querySelector('#upload-preview');
const removePhoto = document.querySelector('#remove-photo');
const description = document.querySelector('#description');
const charCount = document.querySelector('#char-count');
const toast = document.querySelector('#toast');
const resultOverlay = document.querySelector('#result-overlay');
const form = document.querySelector('#assessment-form');
const selectedChoices = new Set();
let localPhotoUrl = null;
let localPhotoFile = null;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function showPhoto(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    photoInput.value = '';
    showToast('请选择 JPG、PNG 或其他图片格式。');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    photoInput.value = '';
    showToast('图片大小请控制在 10MB 以内。');
    return;
  }
  if (localPhotoUrl) URL.revokeObjectURL(localPhotoUrl);
  localPhotoFile = file;
  localPhotoUrl = URL.createObjectURL(file);
  uploadPreview.src = localPhotoUrl;
  uploadPreview.hidden = false;
  uploadPlaceholder.hidden = true;
  removePhoto.hidden = false;
}

photoInput.addEventListener('change', () => showPhoto(photoInput.files?.[0]));
removePhoto.addEventListener('click', (event) => {
  event.stopPropagation();
  photoInput.value = '';
  uploadPreview.removeAttribute('src');
  uploadPreview.hidden = true;
  uploadPlaceholder.hidden = false;
  removePhoto.hidden = true;
  if (localPhotoUrl) URL.revokeObjectURL(localPhotoUrl);
  localPhotoUrl = null;
  localPhotoFile = null;
});

uploadBox.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadBox.classList.add('dragover');
});
uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
uploadBox.addEventListener('drop', (event) => {
  event.preventDefault();
  uploadBox.classList.remove('dragover');
  showPhoto(event.dataTransfer.files?.[0]);
});
uploadBox.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target === uploadBox) {
    event.preventDefault();
    photoInput.click();
  }
});

document.querySelectorAll('.choice-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const choice = chip.dataset.choice;
    if (selectedChoices.has(choice)) {
      selectedChoices.delete(choice);
      chip.classList.remove('selected');
      chip.setAttribute('aria-pressed', 'false');
    } else {
      selectedChoices.add(choice);
      chip.classList.add('selected');
      chip.setAttribute('aria-pressed', 'true');
    }
  });
});

description.addEventListener('input', () => {
  charCount.textContent = `${description.value.length} / 240`;
});

document.querySelectorAll('.concern-card').forEach((card) => {
  card.addEventListener('click', () => {
    const desired = card.dataset.concern;
    const mapping = {
      '头皮容易出油': '头皮出油',
      '发丝干枯毛躁': '发丝干枯',
      '发缝看起来明显': '发缝变化',
      '近期掉发感受变多': '日常掉发',
    };
    const chip = [...document.querySelectorAll('.choice-chip')].find((item) => item.dataset.choice === mapping[desired]);
    if (chip && !selectedChoices.has(chip.dataset.choice)) chip.click();
    card.classList.add('selected');
    document.querySelector('#assessment').scrollIntoView({ behavior: 'smooth' });
  });
});

function makeReport() {
  const choices = [...selectedChoices];
  const notes = description.value.trim();
  const all = [...choices, ...(notes ? [notes] : [])];
  const resultType = choices.includes('头皮出油') && choices.includes('发丝干枯')
    ? '头皮与发丝分区观察'
    : choices.includes('头皮出油') || choices.includes('头皮敏感')
      ? '头皮舒适度观察'
      : choices.includes('发丝干枯') || choices.includes('发缝变化')
        ? '发丝状态记录型'
        : choices.includes('日常掉发')
          ? '日常变化记录型'
          : '日常平衡观察';
  document.querySelector('#result-type').textContent = resultType;

  const tags = document.querySelector('#result-tags');
  tags.replaceChildren();
  (choices.length ? choices : ['综合状态观察']).forEach((label) => {
    const tag = document.createElement('span');
    tag.textContent = label;
    tags.append(tag);
  });

  let observation = '记录洗护后的头皮舒适感，以及发丝在一周中的变化。';
  let recommendation = '尝试在相近光线下记录状态，并保持简单、稳定的洗护节奏，再根据真实感受逐步调整。';
  if (choices.includes('头皮出油')) {
    observation = '观察洗发后清爽感能维持多久，以及运动、天气和作息是否带来变化。';
    recommendation = '按头皮实际出油情况安排清洁，轻柔清洁头皮，并记录洗护后的舒适程度。';
  } else if (choices.includes('发丝干枯')) {
    observation = '留意发尾干燥、打结的频率，以及吹风或染烫后的手感变化。';
    recommendation = '洗后轻柔擦干，减少反复高温造型，并观察发尾对日常护理的感受。';
  } else if (choices.includes('头皮敏感')) {
    observation = '记录头皮紧绷、泛红或不适的时间点，以及近期使用的洗护产品。';
    recommendation = '近期尽量保持洗护步骤简单；如果持续不适或加重，建议咨询专业人士。';
  } else if (choices.includes('发缝变化') || choices.includes('日常掉发')) {
    observation = '在相近光线与角度下做简单记录，观察一段时间的变化趋势。';
    recommendation = '避免单次观察就下结论；若变化持续或让你担心，可咨询皮肤科或相关专业人士。';
  }
  if (notes) observation += ` 你提到的“${notes.slice(0, 42)}${notes.length > 42 ? '…' : ''}”也可以作为后续记录的线索。`;
  document.querySelector('#result-observation').textContent = observation;
  document.querySelector('#result-recommendation').textContent = recommendation;
}

function openReport() {
  makeReport();
  resultOverlay.classList.add('open');
  resultOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.querySelector('#close-report').focus();
}
function closeReport() {
  resultOverlay.classList.remove('open');
  resultOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!selectedChoices.size && !description.value.trim() && !localPhotoFile) {
    showToast('先选择一个关心的方向，或写下你的感受吧。');
    document.querySelector('.concern-field-label').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  openReport();
});

document.querySelector('#modal-close').addEventListener('click', closeReport);
document.querySelector('#close-report').addEventListener('click', closeReport);
document.querySelector('#retry-form').addEventListener('click', () => {
  closeReport();
  document.querySelector('#assessment').scrollIntoView({ behavior: 'smooth' });
});
resultOverlay.addEventListener('click', (event) => {
  if (event.target === resultOverlay) closeReport();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && resultOverlay.classList.contains('open')) closeReport();
});

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileNav.classList.toggle('open', open);
});
mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
  });
});

window.addEventListener('beforeunload', () => {
  if (localPhotoUrl) URL.revokeObjectURL(localPhotoUrl);
});
