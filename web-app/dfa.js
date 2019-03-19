class DFA {

	constructor(states, alphabet, transitions, start, accepting){
		this.states = [];
		this.start = start;

		for (let i = 0; i < states.length; i++){
			let starting = states[i] === start;
			let accept = accepting.includes(states[i]);
	
			this.states.push(new State(state_ids[i], starting, accept));
		}
	}


	test(input){
	}
}



class State {
	constructor(id, start, accepting) {
		this.id = id;
		this.transitions = {};
		this.starting = start;
		this.accepting = accepting;
	}

	show() {
		stroke(0);
		strokeWeight(2);
		fill(90);
		ellipse(this.x, this.y, stateRadius);

		if (this.accepting) {
			noFill();
			ellipse(this.x, this.y, stateRadius + 7);
		}

		fill(255);

		if (this.starting) {
			fill(0, 255, 0);
		}

		noStroke();
		textAlign(CENTER, CENTER);
		textSize(stateRadius / 2);
		text(this.id, this.x, this.y);
	}


	drawTransitions() {
		let keys = Object.keys(this.transitions);

		for (let key of keys) {

			strokeWeight(3)
			stroke(255);

			let state = this.map[key];

			let midX = this.x + (state.x - this.x) / 2;
			let midY = this.y + (state.y - this.y) / 2;

			line(this.x, this.y, state.x, state.y);
			noStroke();
			fill(0);
			text(key, midX, midY);
		}
	}
}