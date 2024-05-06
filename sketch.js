// The original code to generate a note was borrowed from Ivan Rudnicki (https://openprocessing.org/sketch/2011374)
// and remixed with original code and modified functionality for my project

let offset = {
    x: 0,
    y: 0
};
let zoom = 0.5;
let tzoom = 1;
let notes = [];
let speaking = false;
let shuffleCount = 0; // Counter for shuffle presses
let randomStrings = []; // Declare randomStrings array globally
let clickedNoteIndex = -1; // Index of the clicked note, initialized to -1

// Text to display on info button click
let buttonText = `Truman Capote's 'In Cold Blood' is widely recognized as a foundational nonfiction novel and work of New Journalism
for its meticulous detail about a sensationalized crime. Can you piece together what happened in Holcomb?`; 

let displayText = false; // Flag to track if text is displayed


function preload() {
    ch1 = loadStrings('ICB_ch1.txt');
    ch2 = loadStrings('ICB_ch2.txt');
    ch3 = loadStrings('ICB_ch3.txt');
}

function setup() {
    console.log = function () {}; //suppress load voices console message
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360);
    speech = new p5.Speech();
    speech.onEnd = reset;
    speech.onLoad = loaded;

    // Call makeNotes() initially
    makeNotes();
    imageMode(CENTER);
  
    //create button to erase the screen
    button = createButton("I've seen enough");
    button.mouseClicked(closePage);
    button.size(100, 50);
    button.position(10, 200);
    button.style("background-color", "#93b9e1");
    button.style("font-family", "monospace")
    button.style("font-size", "14px");
    button.style("color", "white")
    button.style("hover-color", "#E1BB93")
    
    //create button to retrieve new text
    button1 = createButton("I need more information");
    button1.mouseClicked(restart);
    button1.size(100, 60);
    button1.position(10, 100);
    button1.style("background-color", "#93b9e1");
    button1.style("font-family", "monospace")
    button1.style("font-size", "14px");
    button1.style("color", "white")
    button1.style("hover-color", "#E1BB93")
  
    // create button to display project information
    button2 = createButton("ⓘ");
    button2.mousePressed(toggleButtonText);
    button2.size(25, 25);
    button2.position(10, 30);
    button2.style("border", "none")
    button2.style("background-color", "white");
    button2.style("font-family", "monospace")
    button2.style("font-size", "20px");
    button2.style("color", "black")
    
}

function makeNotes() {
    // Merge the three arrays into one array
    let mergedArray = ch1.concat(ch2, ch3);

    // Shuffle the merged array randomly
    for (let i = mergedArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mergedArray[i], mergedArray[j]] = [mergedArray[j], mergedArray[i]];
    }

    // Exclude strings that consist only of "..", ";.", or ".;"
    mergedArray = mergedArray.filter(str => !['..', ';.', '.;', '.', ';;'].includes(str));

    // Extract n elements from the shuffled array
    let n = 60; // Example value of n
    randomStrings = mergedArray.slice(0, n);

    // Reset notes array
    notes = [];
  
    // Generate notes using randomStrings
    let x = height / 1.5;
    let y = height / 2.2;
    let count = 0;
    for (let i = 0; i < randomStrings.length - 1; i += 2) {
        let img = createGraphics(height / 3, height / 3);
        img.colorMode(HSB, 360);
        img.textFont('monospace');
        img.noStroke();
        let bg = color(random(0, 90), 100, 200, random(50, 90));
        let end = color(90, 0, 360, 150);
        for (let y = 0; y < img.height; y++) {
            let col = lerpColor(end, bg, map(y, 0, img.height, 0, 1));
            img.stroke(col);
            img.line(0, y, img.width, y);
        }
        img.noStroke();
        img.fill(0, 0, 0);
        let ts = min(height / 45, map(randomStrings[i].length, 211, 904, height / 45, height / 300, true));
        if (ts < height / 120) ts = height / 90;
        img.textSize(ts);
        img.text(randomStrings[i] + randomStrings[i + 1], height / 60, height / 60, height / 3.25, 2 * height);
        notes.push(new Note(img, x, y, count, bg, randomStrings[i] + randomStrings[i + 1]));
        x += height / 3;
        if (x > 20 * width / 11) {
            x = height / 1.5;
            y += height / 3;
        }
        count++;
    }
}

function draw() {

    background(0, 0, 360);
    scale(zoom);
    for (let n of notes) {
        n.show();
    }
  
    // Draw shuffle counter
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(30);
    fill("black"); 
    textFont('monospace');
    text("Shuffle Count: " + shuffleCount, 150, 165);
  
    // Display text if displayText is true
    if (displayText) {
        fill(0);
        textSize(30);
        text(buttonText, button2.x + button2.width + 1000, button2.y + button2.height / 1);
    }
}


function mousePressed(event) {

    // Check if any note is clicked
    for (let i = 0; i < notes.length; i++) {
        let note = notes[i];
        let noteCenterX = note.pos.x;
        let noteCenterY = note.pos.y;
        let noteWidth = note.img.width * note.zoom; // Consider the scale of the note
        let noteHeight = note.img.height * note.zoom; // Consider the scale of the note

        // Calculate the distance between the mouse and the note's center
        let distance = dist(mouseX / zoom, mouseY / zoom, noteCenterX, noteCenterY);

        // If the distance is less than half of the note's width and height, the mouse is inside the note
        if (distance < noteWidth / 2 && distance < noteHeight / 2) {
            speaking = true;
            speech.speak(note.txt);
            note.tzoom = 2.5; // Zoom in on the clicked note
            note.tang = random(-PI / 15, PI / 15); // Set a random angle
            clickedNoteIndex = i; // Update clicked note index
            // Reset zoom properties of all other notes
            for (let j = 0; j < notes.length; j++) {
                if (j !== i) {
                    notes[j].tzoom = 1;
                    notes[j].tang = 0; // Reset angle
                }
            }
            break; // Exit the loop after finding the clicked note
        }
    }
}

function mouseMoved() {
    // Check if mouse is over the first button
    if (mouseX > button.position().x && mouseX < button.position().x + button.width && 
        mouseY > button.position().y && mouseY < button.position().y + button.height) {
        button.style("background-color", "#E1BB93"); // Change button color
    } else {
        button.style("background-color", "#93b9e1"); // Reset button color
    }

    // Check if mouse is over the second button
    if (mouseX > button1.position().x && mouseX < button1.position().x + button1.width && 
        mouseY > button1.position().y && mouseY < button1.position().y + button1.height) {
        button1.style("background-color", "#E1BB93"); // Change button color
    } else {
        button1.style("background-color", "#93b9e1"); // Reset button color
    }
  
  // Check if mouse is over the second button
    if (mouseX > button2.position().x && mouseX < button2.position().x + button2.width && 
        mouseY > button2.position().y && mouseY < button2.position().y + button2.height) {
        button2.style("background-color", "lightgray"); // Change button color
    } else {
        button2.style("background-color", "white"); // Reset button color
    }
}


function reset() {
    speaking = false;
    notes[notes.length - 1].tzoom = 1;
    notes[notes.length - 1].tang = random(-PI / 15, PI / 15);
}

function loaded() {
    //speech.listVoices();
    speech.setVoice('Google UK English Female')
    speech.setRate(1);
}

function restart() {
    // Increment shuffle count
    shuffleCount++;
    // Call makeNotes() again
    makeNotes();
}

function closePage() {
    remove();
}

function restart() {
    // Increment shuffle count
    shuffleCount++;
    // Call makeNotes() again
    makeNotes();
}

function toggleButtonText() {
    // Toggle displayText variable
    displayText = !displayText;
}

