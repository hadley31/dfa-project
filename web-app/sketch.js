let dfa;
let radius = 150;
let stateRadius = 100;

function setup() {
	createCanvas(windowWidth, windowHeight);

	let states = [1, 2, 3];
	let alphabet = ['a', 'b', 'c', 'd']
	let start = 1;
	let accepting = [1, 3];

	dfa = new DFA(states, alphabet, null, start, accepting);
}

function draw() {
	background(180);
	translate(width / 2, height / 2);
	for (let s of dfa.states) {
		s.drawTransitions();
		s.show();
	}
}