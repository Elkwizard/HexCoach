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

const createHistoryEntryHTML = entry => {
	const error = getEntryError(entry);
	const { obs, exp } = entry;
	return create("li", {
		style: `--exp: #${exp}; --obs: #${obs};`
	}, [
		create("span", { class: "exp" }, exp),
		create("span", { class: "obs" }, obs),
		create("div", { class: "errors" }, error.map(err => create(
			"span", { style: `--error: ${err};` }
		)))
	]);
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