const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const create = (tag, props, children = []) => {
	const result = document.createElement(tag);
	for (const key in props)
		result.setAttribute(key, props[key]);
	if (typeof children === "string") {
		result.textContent = children;
	} else {
		for (const child of children)
			result.appendChild(child);
	}
	return result;
};

const rgbToHex = rgb => {
	return rgb
		.map(ch => Math.round(ch).toString(16).padStart(2, "0"))
		.join("");
};

const hexToRGB = hex => {
	return hex
		.split(/(.{2})/)
		.filter(Boolean)
		.map(piece => parseInt(piece, 16));
};

const randomChannel = () => Math.random() * 255;
const randomHex = () => rgbToHex([
	randomChannel(),
	randomChannel(),
	randomChannel()
]);

const getEntryError = ({ exp, obs }) => {
	const rgbExp = hexToRGB(exp);
	const rgbObs = hexToRGB(obs);
	return rgbObs.map((c, i) => c - rgbExp[i]);
};

const getBits = errors => {
	const percentError = errors
		.map(err => Math.abs(err))
		.reduce((a, b) => a + b) / (3 * 255);
	return Math.log2(1 / percentError);
};

const mean = list => list.reduce((a, b) => a + b) / list.length;

const getNormalizedErrors = errors => {
	const mu = mean(errors);
	return errors.map(err => err - mu);
};

const getBrightnessError = errors => {
	return mean(errors);
};

const createHistoryEntryHTML = entry => {
	const errors = getEntryError(entry);
	const { obs, exp } = entry;
	
	return create("li", {
		style: `--exp: #${exp}; --obs: #${obs};`
	}, [
		create("span", { class: "exp" }, exp),
		create("span", { class: "obs" }, obs),
		create("span", { class: "score" }, getBits(errors).toFixed(2) + " bits"),
		create("div", { class: "errors" }, errors.map(err => create(
			"span", { style: `--error: ${err};` }
		)))
	]);
};

const updateHistogram = () => {
	const values = history.map(entry => getBits(getEntryError(entry)));

	const BINS = 10;
	const max = Math.max(...values) + 0.001;
	const min = Math.min(...values);
	const bin = (max - min) / BINS;

	const bins = new Array(BINS).fill(0);

	for (const val of values)
		bins[Math.floor((val - min) / bin)] += 1 / values.length;

	$("#histogram").innerHTML = "";

	const maxBin = Math.max(...bins);

	for (let i = 0; i < bins.length; i++) {
		const bin = bins[i];
		$("#histogram").appendChild(create("span", {
			style: `--height: ${bin / maxBin * 100}%; --base-width: ${100 / BINS}%`
		}));
	}
};

const LS_KEY = "hexCoach_ls_1927461762";

const history = JSON.parse(localStorage[LS_KEY] || "[]");

let currentColor;

const endRound = color => {
	const entry = {
		exp: currentColor,
		obs: color
	};
	$("#history").prepend(createHistoryEntryHTML(entry));
	history.push(entry);

	localStorage[LS_KEY] = JSON.stringify(history);

	startRound();
};

const startRound = () => {
	updateHistogram();
	currentColor = randomHex();
	$(":root").style.setProperty("--color", `#${currentColor}`);
	$("#history").scrollTop = 0;
};

addEventListener("load", () => {
	$("#hexInput").focus();

	$("#hexInput").addEventListener("keydown", ({ key }) => {
		const input = $("#hexInput:valid");
		if (key === "Enter" && input) {
			endRound(input.value);
			input.value = "";
		}
	});

	for (const entry of history)
		$("#history").prepend(createHistoryEntryHTML(entry));

	startRound();
});