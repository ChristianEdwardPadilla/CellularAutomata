function gridGenerate(gridSize){
  //deal with bad inputs
  if (!gridSize) gridSize = 15;
  gridSize = parseInt(gridSize);
  if (isNaN(gridSize)){
    throw new Error('input must be a number')
  }
  if (gridSize > 40){
    gridSize = 40;
  }
  if (gridSize < 2){
    gridSize = 2;
  }

  //if there is already a grid, remove it
  const outerContainer = document.querySelector('#outer');
  if (outerContainer.childNodes.length > 0){
    outerContainer.innerHTML = '';
  }

  //create the checkbox elements,add them to an array and append them to outerContainer
  let pixels = [];
  for (let i = 0; i < gridSize; i++){
    let rowContainer = document.createElement('div');
    rowContainer.classList.add('row');
    outerContainer.appendChild(rowContainer);
    for (let j = 0; j < gridSize; j++){
      let pixel = document.createElement('input');
      pixel.type = 'checkbox';
      let id = (i*gridSize) + j;
      pixel.id = id;
      rowContainer.appendChild(pixel);
      pixels.push(pixel);
    }
  }
  //return list of button elements
  return pixels;
}

//wipe the grid and turn some back on randomly
function gridPopulate(pixels, chance){
  if (!chance) chance = 0.15;
  for (let pixel of pixels){
    pixel.checked = false;
    let choice = Math.random();
    if (choice <= chance){
      pixel.checked = true;
    }
  }
}

function measureGrid(pixels){
  const gS = Math.sqrt(pixels.length); //gS stands for gridSize
  const neighborNumbers = [];
  for (let i = 0; i < pixels.length; i++){
    neighborNumbers.push(0)
  }
  //allowed values (since they are all stored in one contiguous array)
  let mapping = [
    -gS-1,-gS,-gS+1,
       -1,        1,
     gS-1, gS, gS+1
  ];
  //look thru the pixels, 
  //if it is checked add 1 to all the nearby pixels' mappings (if within the grid)
  for (let pixel of pixels){
    let id = parseInt(pixel.id);
    if (pixel.checked){
      for (let mapVal of mapping){
        let candidateIDX = id + mapVal;
        //out of bounds condition for above and below the grid
        if (candidateIDX < 0 || candidateIDX > pixels.length-1) continue;
        //out of bounds condition for left edge of the grid
        if (id % gS === 0){
          if (mapVal === -1 || mapVal === -gS-1 || mapVal === gS-1) continue;
        }
        //out of bounds condition for right edge of the grid
        if (id % gS === gS-1){
          if (mapVal === 1 || mapVal === -gS+1 || mapVal === gS+1) continue;
        }
        //this mapVal + id combination passed the out-of-bounds test, so increment its neighbor value
        neighborNumbers[candidateIDX]++
      }
    }
  }
  return neighborNumbers;
}

function updateGrid(pixels,neighborNumbers){
  for (let i = 0; i < neighborNumbers.length; i++){
    if (pixels[i].checked){
      if (!survivalNums.includes(neighborNumbers[i])) pixels[i].checked = false;
    }else{
      if (birthNums.includes(neighborNumbers[i])) pixels[i].checked = true;
    }
  }
}

// function updateGrid(pixels,neighborNumbers){
//   for (let i = 0; i < neighborNumbers.length; i++){
//     if (pixels[i].checked){
//       if (neighborNumbers[i] < 2 || neighborNumbers[i] > 3) pixels[i].checked = false;
//     }else{
//       if (neighborNumbers[i] === 3) pixels[i].checked = true;
//     }
//   }
// }

//update the grid every 500ms while the autoflag is up
function mainLoop(){
  if (autoFlag){
    const neighborNumbers = measureGrid(globalPixels);
    updateGrid(globalPixels,neighborNumbers);
    measureGrid(globalPixels);
    setTimeout(mainLoop, 500);
  }
}

//grab elements
const nextButton = document.querySelector('#next');
const autoButton = document.querySelector('#auto');
const generateButton = document.querySelector('#generate');
const populateButton = document.querySelector('#populate');
const generateInput = document.querySelector('#generate-input');
const populateInput = document.querySelector('#populate-input');

const survivalRule = document.querySelectorAll('.survival-rule');
const birthRule = document.querySelectorAll('.birth-rule');

//initialization of global stuff
let globalPixels = gridGenerate(15);
const survivalNums = [2,3];
const birthNums = [3];
let autoFlag = false;
gridPopulate(globalPixels);

document.addEventListener('DOMContentLoaded', function(){
  //buttons functionality
  nextButton.addEventListener('click', () => {
    const neighborNumbers = measureGrid(globalPixels);
    updateGrid(globalPixels,neighborNumbers);
    measureGrid(globalPixels);
  });
  autoButton.addEventListener('click', () => {
    autoFlag = !autoFlag;
    mainLoop();
  });
  generateButton.addEventListener('click', () => {globalPixels = gridGenerate(generateInput.value)});
  populateButton.addEventListener('click', () => {gridPopulate(globalPixels,populateInput.value)});

  //update the rules when the ruleButtons are clicked
  for (let el of survivalRule){
    el.addEventListener('change', (event) => {
      const pressedButtonIdx = parseInt(event.target.id);
      const ruleIdx = survivalNums.indexOf(pressedButtonIdx);
      if (ruleIdx !== -1) {survivalNums.splice(ruleIdx, 1)}
      else{survivalNums.push(pressedButtonIdx)};
    });
  }
  for (let el of birthRule){
    el.addEventListener('change', (event) => {
      const pressedButtonIdx = parseInt(event.target.id);
      const ruleIdx = birthNums.indexOf(pressedButtonIdx);
      if (ruleIdx !== -1) {birthNums.splice(ruleIdx, 1)}
      else{birthNums.push(pressedButtonIdx)};
    });
  }
})