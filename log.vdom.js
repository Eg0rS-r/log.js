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
		if (vnode.props[i].name === 'l-for') {
			let forValues = vnode.props[i].value.split(/ in /g);
			localVnode.props.removeNamedItem(vnode.props[i].name);
			let forArr = localData[forValues[1]];
			
			for (let i = 0; i < forArr.length; i++) {
				localData[forValues[0]] = localData[forValues[1]][i]
				mount(localVnode, container, localData)
			}
			continue
		}
		el.setAttribute(vnode.props[i].name, vnode.props[i].value)
	}

	if (typeof vnode.children === 'string') {
		let dataVar = vnode.children.match(/{{ [A-z]+ }}/g);
		if (dataVar) {
			dataVar.forEach(item => {
				console.log(item)
				console.log(localData[item.match(/[A-z]+/)[0]])
				el.textContent = vnode.children.replace(item, localData[item.match(/[A-z]+/)[0]])
			})
		// } else if (/{{ [A-z]+\.[A-z]+/g.exec(vnode.children)) {
		// 	/[A-z]+/g.exec(vnode.children).forEach(item => {
		// 		// {{ [A-z]+\..* }}U
		// 		el.textContent = vnode.children.replace(item, localData[item.match(/[A-z]+/)[0]])
		// 	})
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

const insertMount = (vnode, parent) => {



	insertBefore(vnode.$el, parent.$el.children[vnode.order + 1])
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