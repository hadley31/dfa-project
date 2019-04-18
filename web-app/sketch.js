let radius = 300;
let state_radius = 70;

let alphabet;
let states;

let test_complete = true;

let current_state;
let last_transition;

function setup() {

	createCanvas(windowWidth, windowHeight);

	let params = getUrlParams();

	if (!params || !params.a || !params.s || !params.t || !params.ss || !params.as || !params.test) {
		console.error('Parameter error.');
		return;
	}

	let alphabet = [...params.a.match(/[a-zA-Z0-9]+/g)];
	let state_ids = [...params.s.match(/[a-zA-Z0-9]+/g)];
	let transitions_temp = [...params.t.match(/[a-zA-Z0-9]+/g)];

	console.log(state_ids);
	console.log(alphabet);

	console.log(transitions_temp);

	if (transitions_temp.length != state_ids.length * alphabet.length){
		console.log('Transition parameter error.');
		return;
	}

	let transitions = [];

	for (let i = 0; i < state_ids.length; i++){
		let result = {};
		for (let j = 0; j < alphabet.length; j++){
			result[alphabet[j]] = transitions_temp[i * alphabet.length + j];
		}
		transitions.push(result);
	}

	let start_state = params.ss;
	let accepting_states = [...params.as.match(/[a-zA-Z0-9]+/g)];

	console.log(transitions);
	console.log(start_state);
	console.log(accepting_states);

	let test_string_match = params.test.match(/[a-zA-Z0-9]+/);

	let test_string = test_string_match ? test_string_match[0] : '';

	initStates(
		state_ids,
		alphabet,
		transitions,
		start_state,
		accepting_states
	);


	test(test_string);
}

function initStates(stateids, alpha, transitions, start, accepting) {

	alphabet = alpha;
	states = [];

	for (let i = 0; i < stateids.length; ++i) {

		let id = stateids[i];
		//let x = i * (stateRadius * 1.5) + 2 * stateRadius;
		//let y = height / 2;

		// let x = random(0 + stateRadius, width - stateRadius);
		// let y = random(0 + stateRadius, height - stateRadius);

		let angle = i / stateids.length * TWO_PI + PI;
		let x = width / 2 + cos(angle) * radius;
		let y = height / 2 + sin(angle) * radius;

		let r = state_radius;

		states.push(new State(id, x, y, r, transitions[i], id == start, accepting.includes(id)));
	}

	start = states.find(x => x.isStart);
}

function draw() {
	background(66, 134, 244);

	for (let s of states) {
		drawTransitions(s);
	}

	for (let s of states) {
		s.show();
	}
}


function clearDFA() {
	if (test_complete === false) {
		return;
	}
	current_state = undefined;
	last_transition = undefined;
}


function getUrlParams() {
	var vars = {};
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
		vars[key] = value;
	});
	return vars;
}



async function test(input) {

	if (test_complete === false) {
		return;
	}

	if(input == undefined){
		input = '';
	}

	console.log('Testing: ' + input);

	test_complete = false;
	current_state = states.find(x => x.isStart == true);

	for (let c of input) {
		await sleep(1000);
		if (current_state == undefined) {
			console.log('No current state???');
			return;
		}

		last_transition = {
			id: current_state.id,
			symbol: c
		};
		current_state = current_state.transition(c);
	}

	test_complete = true;

	if (current_state.isAccepting) {
		// String accepted
	} else {
		// String not accepted
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

class State {
	constructor(id, x, y, r, t, s, a) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.r = r;
		this.transitions = t;
		this.isStart = s;
		this.isAccepting = a;
	}

	get position() {
		return createVector(this.x, this.y);
	}

	show() {
		if (this === current_state) {
			fill(220);
		} else {
			fill(100);
		}

		if (test_complete && this == current_state) {
			let c = this.isAccepting ? color(0, 220, 0) : color(220, 0, 0);
			fill(c);
		}

		stroke(0);
		strokeWeight(state_radius / 25);
		ellipseMode(CENTER, CENTER);
		ellipse(this.x, this.y, this.r);

		if (this.isAccepting) {
			ellipse(this.x, this.y, this.r * 0.85);
		}

		if (this.isStart) {
			strokeWeight(state_radius / 15);
			let x1 = this.x - this.r / 2;
			line(x1, this.y, x1 - this.r / 3, this.y + this.r / 3);
			line(x1, this.y, x1 - this.r / 3, this.y - this.r / 3);
		}

		noStroke();
		fill(0);
		textSize(this.r / 2);
		textAlign(CENTER, CENTER);
		text(this.id, this.x, this.y);
	}

	transition(symbol) {
		return states.find(x => x.id === this.transitions[symbol]);
	}
}

function drawTransitions(state) {

	let trans = {};
	for (let a of Object.keys(state.transitions)) {
		let s = state.transition(a).id;
		if (trans[s]) {
			trans[s].push(a);
		} else {
			trans[s] = [a];
		}
	}

	for (let s of Object.keys(trans)) {

		let other = getStateByID(s);


		stroke(0);

		if (last_transition && last_transition.id == state.id && trans[s].includes(last_transition.symbol)) {
			stroke(220);
		}

		strokeWeight(state_radius / 20);

		if (state == other) {
			var textPos = p5.Vector.sub(state.position, createVector(0, state_radius * 0.7));
		} else {
			let dir = p5.Vector.sub(other.position, state.position);

			let per = dir.copy();
			per.rotate(HALF_PI);

			dir.normalize();
			per.normalize();

			let pos1 = p5.Vector.add(state.position, p5.Vector.mult(dir, state_radius / 2));
			let pos2 = p5.Vector.sub(other.position, p5.Vector.mult(dir, state_radius / 2));

			pos1.add(p5.Vector.mult(per, state_radius / 10));
			pos2.add(p5.Vector.mult(per, state_radius / 10));

			let dist = p5.Vector.mag(p5.Vector.sub(pos1, pos2));

			line(pos1.x, pos1.y, pos2.x, pos2.y);

			let al = state_radius / 10;

			let arrowPos1 = p5.Vector.add(p5.Vector.sub(pos2, p5.Vector.mult(dir, al)), p5.Vector.mult(per, al));
			let arrowPos2 = p5.Vector.sub(p5.Vector.sub(pos2, p5.Vector.mult(dir, al)), p5.Vector.mult(per, al));

			line(pos2.x, pos2.y, arrowPos1.x, arrowPos1.y);
			line(pos2.x, pos2.y, arrowPos2.x, arrowPos2.y);

			var textPos = pos1.copy();
			textPos.add(p5.Vector.mult(dir, dist / 2));
			textPos.add(p5.Vector.mult(per, state_radius / 3));
		}

		let t = getTransString(trans[s]);

		noStroke();
		textSize(state_radius / 3);
		fill(255);
		text(t, textPos.x, textPos.y);
	}
}

function getStateByID(id) {
	return states.find(x => x.id == id);
}

function getTransString(arr) {
	if (arr.length == 0) {
		return;
	}
	let str = arr[0];
	for (let i = 1; i < arr.length; i++) {
		str += ', ' + arr[i];
	}

	return str;
}