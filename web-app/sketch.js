let radius = 150;
let stateRadius = 100;

let states;

let currentState;

function setup() {
	createCanvas(windowWidth, windowHeight);

	initStates(
		['1', '2', '3', '4'], // States
		['a', 'b', 'c'], // Alphabet
		[{
				'a': '1',
				'b': '2',
				'c': '3'
			},
			{
				'a': '3',
				'b': '2',
				'c': '4'
			},
			{
				'a': '1',
				'b': '2',
				'c': '4'
			},
			{
				'a': '3',
				'b': '2',
				'c': '2'
			}
		], // Transition Function
		'1', // Start State
		['3', '4'] // Accepting States
	);

	test('hello');
}

function initStates(stateids, alphabet, transitions, start, accepting) {

	states = [];

	for (let i = 0; i < stateids.length; i++) {
		let id = stateids[i];
		let x = i * (stateRadius * 1.5) + 2 * stateRadius;
		let y = height / 2;
		let r = stateRadius;

		states.push(new State(id, x, y, r, transitions[i], id == start, accepting.includes(id)));
	}

	start = states.find(x => x.isStart);
}

function draw() {
	background(180);

	for (let s of states) {
		s.show();
	}

	currentState = currentState.transition('a');
}


function test(input) {
	for (let c of input) {
		console.log(c);
	}
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

	show() {
		if (this.id === currentStateID) {
			fill(0, 200, 0);
		} else {
			fill(100);
		}

		strokeWeight(3);
		ellipseMode(CENTER, CENTER);
		ellipse(this.x, this.y, this.r);

		if (this.isAccepting) {
			ellipse(this.x, this.y, this.r * 0.9);
		}

		fill(0);
		textSize(this.r / 2);
		textAlign(CENTER, CENTER);
		text(this.id, this.x, this.y);

		if (this.isStart) {
			strokeWeight(8);
			let x1 = this.x - this.r / 2;
			line(x1, this.y, x1 - this.r / 3, this.y + this.r / 3);
			line(x1, this.y, x1 - this.r / 3, this.y - this.r / 3);
		}
	}

	transition(symbol) {
		return states.find(x => x.id === this.transitions[symbol]);
	}
}