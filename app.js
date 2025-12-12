/*
 * Shunting Yard Calculator - app.js
 *
 * Purpose
 *  - Implements a small in-browser calculator using Dijkstra's Shunting Yard
 *    algorithm to convert infix expressions to RPN (Reverse Polish Notation)
 *    and then evaluates the RPN to get a numeric result.
 *
 * Structure
 *  - `Stack` and `Queue` lightweight containers used by the algorithm.
 *  - `ShuntingYard` orchestrates tokenization, infix->RPN conversion, and
 *    evaluation of the resulting RPN expression.
 *  - DOM bindings at the bottom wire HTML buttons/keys to the calculator.
 *
 * Expected HTML
 *  - Buttons/elements with IDs: one, two, three, four, five, six, seven,
 *    eight, nine, zero, plus, subtract, divide, multiply, equals, clear
 *  - A display element with ID: screen
 *
 * Usage
 *  - Type or click digits/operators to build an expression, press Enter or
 *    click `=` to evaluate. The calculator supports +, -, *, / and parentheses.
 *
 * Notes & Limitations
 *  - The tokenizer expects single-character operators and numeric characters
 *    (multi-digit numbers are supported because characters are concatenated).
 *  - No unary operator handling (e.g., leading `-` as negation) is implemented.
 *  - Division by zero will return `Infinity` (native JS behaviour).
 *
 * Example
 *  - Input: "12+3*(4-1)" → RPN: "12 3 4 1 - * +" → Result: 21
 */

// Classes
class Stack {
    constructor() {
        this.array = [];
    }

    push(value) {
        this.array.push(value);
    }

    pop() {
        if (!this.isEmpty()) return this.array.pop();
    }

    peek() {
        return this.array[this.array.length - 1];
    }

    isEmpty() {
        return this.array.length === 0;
    }
}

class Queue {
    constructor() {
        this.array = [];
    }

    enqueue(value) {
        this.array.push(value)
    }

    dequeue() {
        if (!this.isEmpty()) return this.array.shift();
    }

    isEmpty() {
        return this.array.length == 0;
    }

    print() {
        console.log(this.array);
    }
}

class ShuntingYard {
    constructor() {
        this.stream = new Queue();
        this.q = new Queue();
        this.s = new Stack();
    }

    clear() {
        this.q = new Queue();
        this.s = new Stack();
    }

    /**
     * Tokenize a raw input string into numeric and operator tokens and enqueue
     * them into `this.stream` for processing.
     *
     * This method concatenates adjacent numeric characters so multi-digit
     * numbers (and decimals if provided as characters) remain single tokens.
     *
     * @param {string} input - Raw input sequence (example: "12+3*(4-1)")
     */
    makeString(input) {
        let temp = [];
        let tempIndex = 0;
        for (let i = 0; i < input.length; i++) temp.push("");


        for (let i = 0; i < input.length; i++) {
            let token = input[i];
            if (!isNaN(token)) {
                temp[tempIndex] = temp[tempIndex].concat(token);
            }
            else {
                tempIndex++;
                temp[tempIndex++] = token;
            }
        }

        for (let i = 0; i < temp.length; i++) {
            let token = temp[i];
            if (token !== "") this.stream.enqueue(token);
        }
    }

    getPrecedence(op) {
        if (op === "+" || op === "-") return 1;
        else if (op === "*" || op === "/") return 2;
        else return -1;
    }

    compute_infix() {
        // Convert infix tokens (from this.stream) to postfix (RPN) into this.q
        while (!this.stream.isEmpty()) {
            let t = this.stream.dequeue();
            if (!isNaN(t)) this.q.enqueue(t);
            else if (t === "(") this.s.push(t);
            else if (t === ")") {
                // pop operators into output until a left-paren is found
                while (this.s.peek() !== "(") this.q.enqueue(this.s.pop());
                this.s.pop();
            }
            else {
                while (!this.s.isEmpty() && this.getPrecedence(t) <= this.getPrecedence(this.s.peek())) this.q.enqueue(this.s.pop());
                this.s.push(t);
            }
        }
        while (!this.s.isEmpty()) this.q.enqueue(this.s.pop());
    }

    compute_rpn() {
        let stack = new Stack();
        while (!this.q.isEmpty()) {
            let t = this.q.dequeue();
            if (!isNaN(t)) stack.push(t);
            else {
                let b = parseFloat(stack.pop());
                let a = parseFloat(stack.pop());
                switch (t) {
                    case "-":
                        stack.push((a - b).toString());
                        break;
                    case "+":
                        stack.push((a + b).toString());
                        break;
                    case "*":
                        stack.push((a * b).toString());
                        break;
                    case "/":
                        stack.push((a / b).toString());
                        break;
                }
            }
        }
        return parseFloat(stack.pop());
    }
}

// DOM Elements
const one = document.querySelector("#one");
const two = document.querySelector("#two");
const three = document.querySelector("#three");
const four = document.querySelector("#four");
const five = document.querySelector("#five");
const six = document.querySelector("#six");
const seven = document.querySelector("#seven");
const eight = document.querySelector("#eight");
const nine = document.querySelector("#nine");
const zero = document.querySelector("#zero");
const plus = document.querySelector("#plus");
const subtract = document.querySelector("#subtract");
const divide = document.querySelector("#divide");
const multiply = document.querySelector("#multiply");
const equals = document.querySelector("#equals");
const clear = document.querySelector("#clear");
const screen = document.querySelector("#screen");

const keys = [one, two, three, four, five, six, seven, eight, nine, zero, plus, subtract, divide, multiply];

// Screen Output
let calculator = new ShuntingYard();
let output = "";

function updateScreen() {
    screen.innerText = output;
}

function calculate() {
    calculator.makeString(output);
    calculator.compute_infix();
    output = calculator.compute_rpn().toString();
    calculator.clear();
}

// onClickListeners
keys.forEach(key => {
    key.addEventListener('click', () => {
        output = output.concat(key.innerText);
        updateScreen();
    })
});

clear.addEventListener('click', () => {
    output = "";
    calculator.clear();
    updateScreen();
});

equals.addEventListener('click', () => {
    calculate();
    updateScreen();
});

// Key press
this.addEventListener('keydown', (event) => {
    let key = event.key;
    if (!isNaN(key) || key === "+" || key === "-" || key === "*" || key === "/") {
        output = output.concat(key);
        updateScreen();
    }

    if (key === "Enter") {
        calculate();
        updateScreen();
    }

    if (key === "Backspace") {
        output = output.substring(0, output.length - 1);
        updateScreen();
    }
});