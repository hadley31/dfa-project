let radius;
let state_radius;

let alphabet;
let states;

let test_string;
let test_string_index;
let test_complete = true;

let current_state;
let last_transition;

function setup() {

	var canvas = createCanvas(windowWidth, windowHeight);
	canvas.style('display', 'block');

	let params = get_url_params();

	if (!params || !params.a || !params.s || !params.t || !params.ss || !params.as || !params.test) {
		console.error('Parameter error.');
		return;
	}

	let alphabet = [...params.a.match(/[a-z0-9]+/gi)];
	let state_ids = [...params.s.match(/[a-z0-9]+/gi)];
	let transitions_temp = [...params.t.match(/[a-z0-9]+/gi)];

	console.log(state_ids);
	console.log(alphabet);

	console.log(transitions_temp);

	if (transitions_temp.length != state_ids.length * alphabet.length) {
		console.log('Transition parameter error.');
		return;
	}

	let transitions = [];

	for (let i = 0; i < state_ids.length; i++) {
		let result = {};
		for (let j = 0; j < alphabet.length; j++) {
			result[alphabet[j]] = transitions_temp[i * alphabet.length + j];
		}
		transitions.push(result);
	}

	let start_state = params.ss;
	let accepting_states = [...params.as.match(/[a-z0-9]+/gi)];

	console.log(transitions);
	console.log(start_state);
	console.log(accepting_states);

	let test_string_match = params.test.match(/[a-z0-9]+/i);

	let test_string = test_string_match ? test_string_match[0] : '';

	update_radius();

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

		states.push(new State(id, x, y, transitions[i], id == start, accepting.includes(id)));
	}

	start = states.find(x => x.isStart);
}

function draw() {
	background(66, 134, 244);

	for (let s of states) {
		draw_transitions(s);
	}

	for (let s of states) {
		s.show();
	}

	draw_test_string();
}


function clear_dfa() {
	if (test_complete === false) {
		return;
	}
	current_state = undefined;
	last_transition = undefined;
}


function get_url_params() {
	var vars = {};
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
		vars[key] = value;
	});
	return vars;
}

function draw_test_string() {
	if (!test_string) {
		return;
	}

	textAlign(LEFT, CENTER);

	let w = textWidth(test_string);

	let x = width / 2 - w / 2;
	let y = textSize() + 10;

	let str = test_string.substring(0, test_string_index - 1);

	fill(0);
	text(str, x, y);

	x += textWidth(str);

	str = test_string.charAt(test_string_index - 1);

	fill(220);
	text(str, x, y);

	x += textWidth(str);

	str = test_string.substring(test_string_index);

	fill(0);
	text(str, x, y);
}



async function test(input) {

	if (test_complete === false) {
		return;
	}

	if (input == undefined) {
		input = '';
	}

	test_string = input;
	test_string_index = 0;

	console.log('Testing: ' + test_string);

	await sleep(2000);

	test_complete = false;
	current_state = states.find(x => x.isStart == true);

	for (let c of test_string) {
		await sleep(1500);
		if (current_state == undefined) {
			console.log('No current state???');
			return;
		}

		last_transition = {
			id: current_state.id,
			symbol: c
		};
		current_state = current_state.transition(c);
		test_string_index++;
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
	constructor(id, x, y, t, s, a) {
		this.id = id;
		this.x = x;
		this.y = y;
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
		ellipse(this.x, this.y, state_radius);

		if (this.isAccepting) {
			ellipse(this.x, this.y, state_radius * 0.85);
		}

		if (this.isStart) {
			strokeWeight(state_radius / 20);
			let x1 = this.x - state_radius / 2;
			line(x1, this.y, x1 - state_radius / 5, this.y + state_radius / 5);
			line(x1, this.y, x1 - state_radius / 5, this.y - state_radius / 5);
		}

		noStroke();
		fill(0);
		textSize(state_radius / 2);
		textAlign(CENTER, CENTER);
		text(this.id, this.x, this.y);
	}

	transition(symbol) {
		return states.find(x => x.id === this.transitions[symbol]);
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	update_radius();
}

function update_radius() {
	let size = min(width, height);
	radius = size / 4;
	state_radius = size / 10;

	if (!states) return;

	for (let i = 0; i < states.length; ++i) {

		let angle = i / states.length * TWO_PI + PI;
		let x = width / 2 + cos(angle) * radius;
		let y = height / 2 + sin(angle) * radius;

		states[i].x = x;
		states[i].y = y;
	}
}

function draw_transitions(state) {

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

		let other = get_state_by_ID(s);


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

		let t = get_trans_string(trans[s]);

		noStroke();
		textSize(state_radius / 3);
		fill(255);
		textAlign(CENTER, CENTER);
		text(t, textPos.x, textPos.y);
	}
}

function get_state_by_ID(id) {
	return states.find(x => x.id == id);
}

function get_trans_string(arr) {
	if (arr.length == 0) {
		return;
	}
	let str = arr[0];
	for (let i = 1; i < arr.length; i++) {
		str += ', ' + arr[i];
	}

	return str;
}