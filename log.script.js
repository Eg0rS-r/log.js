const copyObj = (mainObj) => {
	let objCopy = {};
	for (let key in mainObj) {
		objCopy[key] = mainObj[key];
	}
	return objCopy;
}

const compareState = (oldState, newState) => {
	let changeState = {};

	for (let key in oldState) {
		// MAYBE ERROR
		if (newState[key] !== oldState[key]) { 
			changeState[key] = newState[key];
		}
	}

	return changeState
}

