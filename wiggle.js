const MY_IMAGE = 'pepelisa.png'

const NUM_CIRCLES = 425;
const MAX_RADIUS = 285;
const FRICTION = 0.99;
const SPEED_DIVISOR = 151;
const WEIGHT_1 = 7.5;
const WEIGHT_2 = 5;
const BACKGROUND_COLOR = 0x000505

let loader;
let imgTexture;
let stage;
let target;
let renderer;
let mouseDown = false;
let circles = [];
let width;
let height;

let mouseX = 25;
let mouseY = 25;

function init() {
    resizeIt();
    window.onresize = resizeIt;

    stage = new PIXI.Stage();
    renderer = PIXI.autoDetectRenderer(width, height);
    renderer.backgroundColor = BACKGROUND_COLOR; 
    renderer.view.style.display = "block";

    stage.on('mousedown', onMouseDown);
    stage.on('touchstart', onMouseDown);
    stage.on('mousemove', onMouseMove);
    stage.on('touchmove', onMouseMove);
    stage.on('mouseup', onMouseUp);
    stage.on('touchend', onMouseUp);

    stage.interactive = true;
    stage.hitArea = new PIXI.Rectangle(0, 0, width, height);

    document.getElementById("canvas-holder").appendChild(renderer.view);

    target = new PIXI.Container();
    target.position.x = width / 2;
    target.position.y = height / 2;
    stage.addChild(target);

    loader = new PIXI.loaders.Loader();
    loader.add("img", MY_IMAGE);
    loader.once('complete', addCircles);

    loader.load();
}

function addCircles() {
    imgTexture = PIXI.utils.TextureCache[MY_IMAGE];
    for (let i = 0; i < NUM_CIRCLES; i++) {

        // Set the radius to be between the max and 0 - based on the current index of the loop
        let radius = map(i, 0, NUM_CIRCLES - 1, MAX_RADIUS, 0);
        let circleHolder = new PIXI.Container();
        let circleSprite = new PIXI.Sprite(imgTexture);

        circleSprite.anchor.x = circleSprite.anchor.y = 0.5;
        circleHolder.addChild(circleSprite);

        let circleMask = new PIXI.Graphics();
        circleMask.beginFill(0x000505);
        circleMask.drawCircle(0, 0, radius);
        circleMask.endFill();

        circleHolder.addChild(circleMask);
        circleSprite.mask = circleMask;

        circleHolder.speedX = 0;
        circleHolder.speedY = 0;
        circleHolder.distX = 0;
        circleHolder.distY = 0;

        // Add a weight, mapped between the 2 letiables, based on the loop index
        circleHolder.weight = map(i, 0, NUM_CIRCLES - 1, WEIGHT_1, WEIGHT_2);
        circleHolder.cacheAsBitmap = true;

        circles.push(circleHolder);
        target.addChild(circleHolder);
    }

    animate();
}

function resizeIt() {
    width = window.innerWidth;
    height = window.innerHeight;

    if (renderer) {
        renderer.resize(width, height);
        stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
    }

    if (target) {
        target.position.x = width / 2;
        target.position.y = height / 2;
    }

}

function animate() {
    let circle;
    for (let i = circles.length - 1; i >= 0; i--) {
        circle = circles[i];
        circle.distX = Math.floor(circle.position.x - mouseX);
        circle.distY = Math.floor(circle.position.y - mouseY);

        // Divide the distance to make the transition not instant, and add that to its speed
        circle.speedX += circle.distX / SPEED_DIVISOR;
        circle.speedY += circle.distY / SPEED_DIVISOR;

        // Reposition the circle based on its speed & weight letiables
        circle.position.x -= circle.speedX * circle.weight;
        circle.position.y -= circle.speedY * circle.weight;

        // Apply friction to the circle's speed
        circle.speedX *= FRICTION;
        circle.speedY *= FRICTION;
    }
    renderer.render(stage);
    requestAnimationFrame(animate);
}

function onMouseDown(mouseData) {
    mouseDown = true;
    let mouse = mouseData.data.getLocalPosition(stage);
    mouseX = mouse.x - width / 2;
    mouseY = mouse.y - height / 2;
}

function onMouseMove(mouseData) {
    if (mouseDown) {
        let mouse = mouseData.data.getLocalPosition(stage);
        mouseX = mouse.x - width / 2;
        mouseY = mouse.y - height / 2;
    }
}

function onMouseUp() {
    mouseDown = false;
}

function map(v, a, b, x, y) {
    return (v == a) ? x : (v - a) * (y - x) / (b - a) + x;
}
init();