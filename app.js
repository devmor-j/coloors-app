import chroma from './_snowpack/pkg/chroma-js.js';

const colorDivs = document.querySelectorAll('.color');

function generateHex() {
  const randomHex = chroma.random();
  return randomHex;
}

function checkContrast(text, color) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = 'black';
  } else {
    text.style.color = 'white';
  }
}

function colorizeSliders(color, hueSlider, brightSlider, satSlider) {
  // adjusting sliders value based on generated color
  hueSlider.value = Math.round(chroma(color).get('hsl.h'));
  brightSlider.value = Math.round(chroma(color).get('hsl.l') * 100) / 100;
  satSlider.value = Math.round(chroma(color).get('hsl.s') * 100) / 100;

  // brightness slider
  const zeroBright = chroma(color).set('hsl.l', 0);
  const fullBright = chroma(color).set('hsl.l', 1);
  const scaleBright = chroma.scale([zeroBright, color, fullBright]);
  brightSlider.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, 
  ${scaleBright(0.5)}, ${scaleBright(1)})`;

  // saturation slider
  const zeroSat = chroma(color).set('hsl.s', 0);
  const fullSat = chroma(color).set('hsl.s', 1);
  const scaleSat = chroma.scale([zeroSat, color, fullSat]);
  satSlider.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(0.5)}, ${scaleSat(1)})`;
}

// page load initial colors for first palette
let initialColors = [];

function generateRandomColors() {
  colorDivs.forEach((colorDiv) => {
    const randomHex = generateHex();
    const colorTitle = colorDiv.children[0];

    // if colorDiv is locked, add previous colorTitle Hex
    if (colorDiv.classList.contains('locked')) {
      initialColors.push(colorTitle.textContent);
      return;
    }

    initialColors.push(chroma(randomHex).hex());

    checkContrast(colorTitle, randomHex);

    const colorControlIcons = colorDiv.querySelectorAll('.controls button');
    colorControlIcons.forEach((icon) => checkContrast(icon, randomHex));

    const slidersDiv = colorDiv.querySelectorAll('.sliders')[0];
    const slidersTitles = Array.from(slidersDiv.querySelectorAll('span'));
    slidersTitles.forEach((sliderTitle) => {
      checkContrast(sliderTitle, randomHex);
    });

    colorDiv.style.backgroundColor = randomHex;
    colorTitle.textContent = randomHex;

    // get all three sliders in each colorDiv
    const sliders = colorDiv.querySelectorAll('.sliders input[type="range"]');
    const hueSlider = sliders[0];
    const brightSlider = sliders[1];
    const satSlider = sliders[2];
    // colorize sliders
    hueSlider.style.backgroundImage = 'linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))';
    colorizeSliders(randomHex, hueSlider, brightSlider, satSlider);
  });
}

const generateButton = document.querySelectorAll('button.generate')[0];
generateButton.addEventListener('click', generateRandomColors);

// initializing random colors on page load
generateRandomColors();

// ----------------------------------------------------------------------------

function hslController(e) {
  const index = e.target.getAttribute('data-bright') || e.target.getAttribute('data-sat') || e.target.getAttribute('data-hue');
  const controlSliders = e.target.parentElement.querySelectorAll('input[type="range"]');

  const hueSlider = controlSliders[0];
  const brightSlider = controlSliders[1];
  const satSlider = controlSliders[2];
  const slideColor = initialColors[index];

  const color = chroma(slideColor)
    .set('hsl.h', hueSlider.value)
    .set('hsl.s', satSlider.value)
    .set('hsl.l', brightSlider.value);
  colorDivs[index].style.backgroundColor = color;
  colorizeSliders(color, hueSlider, brightSlider, satSlider);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const colorTitle = activeDiv.querySelectorAll('h2')[0];
  colorTitle.textContent = color.hex();
  checkContrast(colorTitle, color);

  const colorControlIcons = activeDiv.querySelectorAll('.controls button');
  colorControlIcons.forEach((icon) => checkContrast(icon, color));

  const slidersDiv = activeDiv.querySelectorAll('.sliders')[0];
  const slidersTitles = Array.from(slidersDiv.querySelectorAll('span'));
  slidersTitles.forEach((sliderTitle) => {
    checkContrast(sliderTitle, color);
  });
}

function copyToClipboard(colorHexElement) {
  navigator.clipboard.writeText(colorHexElement.textContent)
    .then(() => {
      const copyContainer = document.querySelectorAll('.copy-container')[0];
      const copyPopup = document.querySelectorAll('.copy-popup')[0];
      copyPopup.classList.add('active');
      copyContainer.classList.add('active');
      copyContainer.addEventListener('transitionend', () => {
        copyContainer.classList.remove('active');
        copyPopup.classList.remove('active');
      });
    });
}

const sliders = document.querySelectorAll('.sliders input[type="range"]');

sliders.forEach((slider) => slider.addEventListener('input', hslController));
colorDivs.forEach((colorDiv, index) => colorDiv.addEventListener('change', () => updateTextUI(index)));

const colorHexTitles = document.querySelectorAll('.color h2');
colorHexTitles.forEach((colorHex) => {
  colorHex.addEventListener('click', () => {
    copyToClipboard(colorHex);
  });
});

// --------------------------------------------------------------------
const lockButtons = document.querySelectorAll('.lock');
const adjustButtons = document.querySelectorAll('.adjust');
const closeAdjustButtons = document.querySelectorAll('.close-adjustment');
const slidersContainers = document.querySelectorAll('.sliders');

lockButtons.forEach((lockButton) => {
  lockButton.addEventListener('click', () => {
    if (lockButton.children[0].classList.contains('fa-lock-open')) {
      lockButton.parentElement.parentElement.classList.add('locked');
      lockButton.children[0].classList.remove('fa-lock-open');
      lockButton.children[0].classList.add('fa-lock');
    } else if ((lockButton.children[0].classList.contains('fa-lock'))) {
      lockButton.parentElement.parentElement.classList.remove('locked');
      lockButton.children[0].classList.remove('fa-lock');
      lockButton.children[0].classList.add('fa-lock-open');
    }
  });
});

adjustButtons.forEach((adjustButton, index) => {
  adjustButton.addEventListener('click', () => {
    slidersContainers[index].classList.toggle('active');
  });
});

closeAdjustButtons.forEach((closeAdjustButton, index) => {
  closeAdjustButton.addEventListener('click', () => {
    slidersContainers[index].classList.remove('active');
  });
});

// -----------------------------------------------------------------------

const libraryButton = document.querySelectorAll('.library')[0];
const libraryContainer = document.querySelectorAll('.library-container')[0];
const closeLibraryPanel = document.querySelectorAll('.close-library')[0];

function openLibrary() {
  libraryContainer.classList.add('active');
  libraryContainer.children[0].classList.add('active');
}

function closeLibrary() {
  libraryContainer.classList.remove('active');
  libraryContainer.children[0].classList.remove('active');
}

libraryButton.addEventListener('click', openLibrary);
closeLibraryPanel.addEventListener('click', closeLibrary);

// -----------------------------------------------------------------------

const saveButton = document.querySelectorAll('.save')[0];
const saveContainer = document.querySelectorAll('.save-container')[0];
const closeSavePanel = document.querySelectorAll('.close-save')[0];
const saveInput = document.querySelectorAll('.save-container input')[0];
const submitSave = document.querySelectorAll('.submit-save')[0];

function openPalette() {
  saveContainer.classList.add('active');
  saveContainer.children[0].classList.add('active');
}

function closePalette() {
  saveContainer.classList.remove('active');
  saveContainer.children[0].classList.remove('active');
}

let savedPalettes = [];

function saveToLocalStorage(paletteObj) {
  let localPalette;
  if (localStorage.getItem('palettes') === null) {
    localPalette = [];
  } else {
    localPalette = JSON.parse(localStorage.getItem('palettes'));
  }
  localPalette.push(paletteObj);
  localStorage.setItem('palettes', JSON.stringify(localPalette));
}

function updateLocalStorage(palettes) {
  if (localStorage.getItem('palettes') === null) {
    return;
  }
  localStorage.setItem('palettes', JSON.stringify(palettes));
}

function updateLibrary(paletteObj) {
  const customPalette = document.createElement('div');
  customPalette.classList.add('custom-palette');

  const paletteTitle = document.createElement('h4');
  paletteTitle.textContent = paletteObj.name;

  const preview = document.createElement('div');
  preview.classList.add('small-preview');

  const previewFragment = document.createDocumentFragment();

  paletteObj.colors.forEach((smallColor) => {
    const colorFragment = document.createElement('div');
    colorFragment.style.backgroundColor = smallColor;
    previewFragment.appendChild(colorFragment);
  });

  preview.appendChild(previewFragment);

  const selectPaletteButton = document.createElement('button');
  selectPaletteButton.classList.add('select-palette-button');
  selectPaletteButton.classList.add(paletteObj.index);
  selectPaletteButton.innerHTML = '<i class="fas fa-check"></i>';

  const removePaletteButton = document.createElement('button');
  removePaletteButton.classList.add('remove-palette-button');
  removePaletteButton.classList.add(paletteObj.index);
  removePaletteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';

  customPalette.appendChild(paletteTitle);
  customPalette.appendChild(preview);
  customPalette.appendChild(selectPaletteButton);
  customPalette.appendChild(removePaletteButton);

  libraryContainer.children[0].appendChild(customPalette);

  selectPaletteButton.addEventListener('click', (e) => {
    closeLibrary();

    initialColors = [];

    const paletteName = e.target.parentElement.querySelectorAll('h4')[0].textContent;
    const paletteIndex = savedPalettes.findIndex((palette) => palette.name === paletteName);

    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      colorHexTitles[index].textContent = color;
      updateTextUI(index);

      const slider = colorDivs[index].querySelectorAll('.sliders input[type="range"]');
      const hueSlider = slider[0];
      const brightSlider = slider[1];
      const satSlider = slider[2];
      colorizeSliders(color, hueSlider, brightSlider, satSlider);
    });
  });

  removePaletteButton.addEventListener('click', (e) => {
    e.target.parentElement.remove();
    const paletteName = e.target.parentElement.querySelectorAll('h4')[0].textContent;
    const paletteIndex = savedPalettes.findIndex((palette) => palette.name === paletteName);
    savedPalettes.splice(paletteIndex, 1);
    updateLocalStorage(savedPalettes);
  });
}

function savePalette() {
  closePalette();

  const colorHexes = Array.from(colorHexTitles).map((colorHex) => colorHex.textContent);
  const paletteIndex = savedPalettes.length;
  const paletteName = saveInput.value;

  const paletteObj = { index: paletteIndex, name: paletteName, colors: colorHexes };

  savedPalettes.push(paletteObj);
  saveToLocalStorage(paletteObj);
  saveInput.value = '';
  updateLibrary(paletteObj);
}

saveButton.addEventListener('click', openPalette);
closeSavePanel.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);

async function loadFromLocalStorage() {
  if (localStorage.getItem('palettes') === null) {
    return;
  }
  const localPalette = await JSON.parse(localStorage.getItem('palettes'));
  savedPalettes = localPalette;
  localPalette.forEach((palette) => {
    updateLibrary(palette);
  });
}

loadFromLocalStorage();

const clearAllButton = document.querySelectorAll('.clear-all-button')[0];

function clearAllPalettes() {
  document.querySelectorAll('.custom-palette').forEach((palette) => palette.remove());
  updateLocalStorage([]);
}

clearAllButton.addEventListener('click', clearAllPalettes);

// *********************************************************
// BUG: initialColors grow in size by generating new palette
// *********************************************************

// *********************************************************
// BUG: creating palettes with same name, results incorrect palettes on selection
// better to make data-id on eath palette item so with uniqte id generaton (uuid4)
// no conflict would occur
// *********************************************************
