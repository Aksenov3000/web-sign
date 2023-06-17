'use strict';

// include libraries
require('../libraries/common/index');
require('../libraries/cryptopro/index');
require('../libraries/rutoken/index');

// main class
class WebSign // extends EventTarget
{

	// certificate list.
	#certificates = new Map();

	// library instaces.
	#libraryInstances = new Set();

	certificateAddedCallbacks = new Set();
	certificateRemovedCallbacks = new Set();
	errorCallbacks = new Set();
	signCallbacks = new Set();

	constructor()
	{
		// register libraries
		var cp = new WebSignCryptoPro();
		cp.certificateAddedCallbacks.add(function (cert)
		{
			this.#certificates.add(cert.id, cert);
			this.certificateAddedCallbacks.forEach(function (v) { v(cert); });
		});
		this.#libraryInstances.push(cp);

		var rt = new WebSignRutoken();
		rt.certificateAddedCallbacks.add(function (cert)
		{
			this.#certificates.delete(cert.id);
			this.certificateAddedCallbacks.forEach(function (v) { v(cert); });
		});
		this.#libraryInstances.push(rt);
	}

	SignHash(certificateId, hashAsHex)
	{
		// detect library
		// call library
		// save result
		this.signCallbacks.forEach(function (v) { v("Signature"); });
	}
}
