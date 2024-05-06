// The code to generate a note was borrowed from Ivan Rudnicki (https://openprocessing.org/sketch/2011374)
// and remixed with added and modified functionality for my project
class Note {
	constructor(img, x, y, id, f, txt) {
		this.pos = p5.Vector.random2D().mult(3*width);
		this.tpos = createVector(x, y);
		this.img = img;
		this.id = id;
		this.ang = TAU;
		this.tang = random(-PI / 15, PI / 15);
		this.zoom = 5;
		this.tzoom = 1;
		this.scatter = random(200);
		this.f = f;
		this.txt = txt;
	}
	show() {
		if (frameCount > this.scatter) {
			this.pos.lerp(this.tpos, 0.1);
			this.ang = lerp(this.ang, this.tang, 0.1);
			this.zoom = lerp(this.zoom, this.tzoom, 0.2);
		}
		push();
		translate(this.pos);
		scale(this.zoom);
		rotate(this.ang);
		if (notes.indexOf(this) == notes.length - 1) {
			noStroke();
			this.f.setAlpha(-50 + (this.zoom * 100));
			fill(this.f);
			rectMode(CENTER);
			rect(0, 0, this.img.width, this.img.height)
		}
		image(this.img, 0, 0);
		pop();
	}
}

