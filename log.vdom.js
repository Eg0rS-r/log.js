const createNode = (element, orderCount) => {
	let children = [...element.children];
	if (children.length === 0) {
		children = element.innerHTML;
	} else {
		children = children.map((childElement, index) => {
			return createNode(childElement, index)
		});
	}
	return { tag: element.localName, props: element.attributes, children, order: orderCount }
}

const mount = (vnode, container, data) => {
	let localData = copyObj(data)
	let localVnode = copyObj(vnode)
	const el = document.createElement(vnode.tag)

	for (let i = 0; i < vnode.props.length; i++) {
		if (vnode.props[i].name === 'l-if') {
			if (localData[vnode.props[i].value] === false) {
				return
			}
		}
		el.setAttribute(vnode.props[i].name, vnode.props[i].value)
	}

	if (typeof vnode.children === 'string') {
		let dataVar = vnode.children.match(/{{ [A-z]+ }}/g);
		if (dataVar) {
			dataVar.forEach(item => {
				el.textContent = vnode.children.replace(item, localData[item.match(/[A-z]+/)[0]])
			})
		} else {
			el.textContent = vnode.children
		}
	}
	else {
		vnode.children.forEach(child => {
			mount(child, el, localData)
		});
	}

	vnode.$el = el


	
	if (container.children[vnode.order]) {

		container.insertBefore(vnode.$el, container.children[vnode.order])
	} else {
		container.appendChild(el)
	}

}

const unmount = (vnode) => {
	vnode.$el.parentNode.removeChild(vnode.$el)
}

const patchMount = (parentVNode, vnode, changeState) => {

	for (let i = 0; i < vnode.props.length; i++) {
		if (vnode.props[i].name === 'l-if') {
			if (changeState[vnode.props[i].value] !== undefined) {
				if (changeState[vnode.props[i].value] === true) {
					mount(vnode, parentVNode.$el, state)
				} else if (vnode.$el) {
					unmount(vnode)
				}
			}
		}
	}

	if (typeof vnode.children === 'string') {
		let dataVar = /{{ [A-z]+ }}/g.exec(vnode.children);
		if (dataVar) {
			dataVar.forEach(item => {
				for (let key in changeState) {
					if (item.match(/[A-z]+/)[0] === key) {
						vnode.$el.textContent = vnode.children.replace(item, changeState[key])
					}
				}
			})
		}
	} else {
		vnode.children.forEach(child => {
			patchMount(vnode, child, changeState)
		});
	}

}