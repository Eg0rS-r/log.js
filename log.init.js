vnode = createNode(document.getElementById('container'), 0)
document.getElementById('app').innerHTML = ''
mount(vnode, document.getElementById('app'), state)

let currentState;
watchEffect(() => {
	patchMount(document.getElementById('app'), vnode, compareState(currentState, state));
	currentState = copyObj(state);
})