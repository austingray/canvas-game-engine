(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.game = factory());
}(this, (function () { 'use strict';

    /**
     * Byte sizes are taken from ECMAScript Language Specification
     * http://www.ecma-international.org/ecma-262/5.1/
     * http://bclary.com/2004/11/07/#a-4.3.16
     */

    var byte_size = {
        STRING: 2,
        BOOLEAN: 4,
        NUMBER: 8
    };

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
    var inited = false;
    function init () {
      inited = true;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
    }

    function toByteArray (b64) {
      if (!inited) {
        init();
      }
      var i, j, l, tmp, placeHolders, arr;
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

      // base64 is 4/3 + up to two characters of the original data
      arr = new Arr(len * 3 / 4 - placeHolders);

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len;

      var L = 0;

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
        arr[L++] = (tmp >> 16) & 0xFF;
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[L++] = tmp & 0xFF;
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      return arr
    }

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk (uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join('')
    }

    function fromByteArray (uint8) {
      if (!inited) {
        init();
      }
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var output = '';
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[(tmp << 4) & 0x3F];
        output += '==';
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
        output += lookup[tmp >> 10];
        output += lookup[(tmp >> 4) & 0x3F];
        output += lookup[(tmp << 2) & 0x3F];
        output += '=';
      }

      parts.push(output);

      return parts.join('')
    }

    function read (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    function write (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    }

    var toString = {}.toString;

    var isArray = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };

    var INSPECT_MAX_BYTES = 50;

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Due to various browser bugs, sometimes the Object implementation will be used even
     * when the browser supports typed arrays.
     *
     * Note:
     *
     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *     incorrect length in some situations.

     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
     * get the Object implementation, which is slower but behaves correctly.
     */
    Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
      ? global$1.TYPED_ARRAY_SUPPORT
      : true;

    /*
     * Export kMaxLength after typed array support is determined.
     */
    var _kMaxLength = kMaxLength();

    function kMaxLength () {
      return Buffer.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff
    }

    function createBuffer (that, length) {
      if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length')
      }
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = new Uint8Array(length);
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        if (that === null) {
          that = new Buffer(length);
        }
        that.length = length;
      }

      return that
    }

    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */

    function Buffer (arg, encodingOrOffset, length) {
      if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
        return new Buffer(arg, encodingOrOffset, length)
      }

      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(this, arg)
      }
      return from(this, arg, encodingOrOffset, length)
    }

    Buffer.poolSize = 8192; // not used by this implementation

    // TODO: Legacy, not needed anymore. Remove in next major version.
    Buffer._augment = function (arr) {
      arr.__proto__ = Buffer.prototype;
      return arr
    };

    function from (that, value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }

      if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length)
      }

      if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset)
      }

      return fromObject(that, value)
    }

    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length)
    };

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      Buffer.prototype.__proto__ = Uint8Array.prototype;
      Buffer.__proto__ = Uint8Array;
    }

    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }

    function alloc (that, size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(that, size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(that, size).fill(fill, encoding)
          : createBuffer(that, size).fill(fill)
      }
      return createBuffer(that, size)
    }

    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(null, size, fill, encoding)
    };

    function allocUnsafe (that, size) {
      assertSize(size);
      that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
          that[i] = 0;
        }
      }
      return that
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(null, size)
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(null, size)
    };

    function fromString (that, string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }

      var length = byteLength(string, encoding) | 0;
      that = createBuffer(that, length);

      var actual = that.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        that = that.slice(0, actual);
      }

      return that
    }

    function fromArrayLike (that, array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      that = createBuffer(that, length);
      for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255;
      }
      return that
    }

    function fromArrayBuffer (that, array, byteOffset, length) {
      array.byteLength; // this throws if `array` is not a valid ArrayBuffer

      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }

      if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array);
      } else if (length === undefined) {
        array = new Uint8Array(array, byteOffset);
      } else {
        array = new Uint8Array(array, byteOffset, length);
      }

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = array;
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        that = fromArrayLike(that, array);
      }
      return that
    }

    function fromObject (that, obj) {
      if (internalIsBuffer(obj)) {
        var len = checked(obj.length) | 0;
        that = createBuffer(that, len);

        if (that.length === 0) {
          return that
        }

        obj.copy(that, 0, 0, len);
        return that
      }

      if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
          if (typeof obj.length !== 'number' || isnan(obj.length)) {
            return createBuffer(that, 0)
          }
          return fromArrayLike(that, obj)
        }

        if (obj.type === 'Buffer' && isArray(obj.data)) {
          return fromArrayLike(that, obj.data)
        }
      }

      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }

    function checked (length) {
      // Note: cannot use `length < kMaxLength()` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + kMaxLength().toString(16) + ' bytes')
      }
      return length | 0
    }

    function SlowBuffer (length) {
      if (+length != length) { // eslint-disable-line eqeqeq
        length = 0;
      }
      return Buffer.alloc(+length)
    }
    Buffer.isBuffer = isBuffer;
    function internalIsBuffer (b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer.compare = function compare (a, b) {
      if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }

      if (a === b) return 0

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    Buffer.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    };

    Buffer.concat = function concat (list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }

      if (list.length === 0) {
        return Buffer.alloc(0)
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer
    };

    function byteLength (string, encoding) {
      if (internalIsBuffer(string)) {
        return string.length
      }
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
          (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string;
      }

      var len = string.length;
      if (len === 0) return 0

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength;

    function slowToString (encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return ''
      }

      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return ''
      }

      if (!encoding) encoding = 'utf8';

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)

          case 'ascii':
            return asciiSlice(this, start, end)

          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)

          case 'base64':
            return base64Slice(this, start, end)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
    // Buffer instances.
    Buffer.prototype._isBuffer = true;

    function swap (b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this
    };

    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this
    };

    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this
    };

    Buffer.prototype.toString = function toString () {
      var length = this.length | 0;
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    };

    Buffer.prototype.equals = function equals (b) {
      if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    };

    Buffer.prototype.inspect = function inspect () {
      var str = '';
      var max = INSPECT_MAX_BYTES;
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
        if (this.length > max) str += ' ... ';
      }
      return '<Buffer ' + str + '>'
    };

    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!internalIsBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
      }

      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }

      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1

      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
      }
      byteOffset = +byteOffset;  // Coerce to Number.
      if (isNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1);
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (internalIsBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (Buffer.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read$$1 (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read$$1(arr, i) === read$$1(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read$$1(arr, i + j) !== read$$1(val, j)) {
              found = false;
              break
            }
          }
          if (found) return i
        }
      }

      return -1
    }

    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    };

    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    };

    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    };

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      // must be an even number of digits
      var strLen = string.length;
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (isNaN(parsed)) return i
        buf[offset + i] = parsed;
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }

    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }

    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }

    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }

    Buffer.prototype.write = function write$$1 (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
          length = length | 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      // legacy write(string, encoding, offset, length) - remove in v0.13
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)

          case 'ascii':
            return asciiWrite(this, string, offset, length)

          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)

          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    };

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return fromByteArray(buf)
      } else {
        return fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res)
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res
    }

    function asciiSlice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret
    }

    function latin1Slice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret
    }

    function hexSlice (buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res
    }

    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer.prototype;
      } else {
        var sliceLen = end - start;
        newBuf = new Buffer(sliceLen, undefined);
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start];
        }
      }

      return newBuf
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val
    };

    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val
    };

    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset]
    };

    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | (this[offset + 1] << 8)
    };

    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return (this[offset] << 8) | this[offset + 1]
    };

    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    };

    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    };

    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    };

    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | (this[offset + 1] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | (this[offset] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    };

    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    };

    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4)
    };

    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4)
    };

    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8)
    };

    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8)
    };

    function checkInt (buf, value, offset, ext, max, min) {
      if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }

    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      this[offset] = (value & 0xff);
      return offset + 1
    };

    function objectWriteUInt16 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8;
      }
    }

    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    function objectWriteUInt32 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
      }
    }

    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (value < 0) value = 0xffffffff + value + 1;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
      }
      write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    };

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
      }
      write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;
      var i;

      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        );
      }

      return len
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (code < 256) {
            val = code;
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }

      if (end <= start) {
        return this
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = internalIsBuffer(val)
          ? val
          : utf8ToBytes(new Buffer(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str
    }

    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes (string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            }

            // valid lead
            leadSurrogate = codePoint;

            continue
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes (str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray
    }

    function utf16leToBytes (str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray
    }


    function base64ToBytes (str) {
      return toByteArray(base64clean(str))
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i];
      }
      return i
    }

    function isnan (val) {
      return val !== val // eslint-disable-line no-self-compare
    }


    // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
    // The _isBuffer check is for Safari 5-7 support, because it's missing
    // Object.prototype.constructor. Remove this eventually
    function isBuffer(obj) {
      return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
    }

    function isFastBuffer (obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    }

    // For Node v0.10 support. Remove this eventually.
    function isSlowBuffer (obj) {
      return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
    }

    var bufferEs6 = /*#__PURE__*/Object.freeze({
        INSPECT_MAX_BYTES: INSPECT_MAX_BYTES,
        kMaxLength: _kMaxLength,
        Buffer: Buffer,
        SlowBuffer: SlowBuffer,
        isBuffer: isBuffer
    });

    var Buffer$1 = bufferEs6.Buffer;

    /**
     * Main module's entry point
     * Calculates Bytes for the provided parameter
     * @param object - handles object/string/boolean/buffer
     * @returns {*}
     */
    function sizeof(object) {
        if (object !== null && typeof (object) === 'object') {
          if (Buffer$1.isBuffer(object)) {
            return object.length;
          }
          else {
            var bytes = 0;
            for (var key in object) {

              if(!Object.hasOwnProperty.call(object, key)) {
                continue;
              }

              bytes += sizeof(key);
              try {
                bytes += sizeof(object[key]);
              } catch (ex) {
                if(ex instanceof RangeError) {
                  // circular reference detected, final result might be incorrect
                  // let's be nice and not throw an exception
                  bytes = 0;
                }
              }
            }
            return bytes;
          }
        } else if (typeof (object) === 'string') {
          return object.length * byte_size.STRING;
        } else if (typeof (object) === 'boolean') {
          return byte_size.BOOLEAN;
        } else if (typeof (object) === 'number') {
          return byte_size.NUMBER;
        } else {
          return 0;
        }
    }

    var objectSizeof = sizeof;

    class Layer {
      /**
       * Creates an instance of Layer.
       * @param {*} id
       * @param {*} [args={}]
       * @memberof Layer
       */
      constructor(id, args = {}) {
        // get width/height
        this.width = args.width;
        this.height = args.height;
        this.name = args.name;
        this.visible = (typeof args.visible === 'undefined') ? true : args.visible;

        const domParent = (typeof args.appendTo === 'undefined') ? document.body : args.appendTo;

        // create the canvas element and add it to the document body
        const element = document.createElement('canvas');
        element.id = id;
        element.width = this.width;
        element.height = this.height;
        domParent.appendChild(element);
        this.element = element;

        if (!this.visible) {
          element.setAttribute('style', 'display: none;');
        }

        // get the context
        this.context = element.getContext(args.context);
      }

      /**
       * Toggle canvas element visibility
       *
       * @memberof Layer
       */
      toggleVisible() {
        if (this.visible) {
          this.visible = false;
          this.element.setAttribute('style', 'display: none;');
        } else {
          this.visible = true;
          this.element.setAttribute('style', '');
        }
      }

      /**
       * Clears the layer
       *
       * @memberof Layer
       */
      clear() {
        if (typeof this.context.clearRect !== 'undefined') {
          this.context.clearRect(0, 0, this.width, this.height);
        }
      }
    }

    /**
     * Calculates drawing x/y offsets
     *
     * @class Camera
     */
    class Camera {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = width / 2;
        this.y = height / 2;
        this.offsetX = 0;
        this.offsetY = 0;
      }

      /**
       * Sets camera focus on an object
       *
       * @param {*} object
       * @param {boolean} [centered=false]
       * @memberof Camera
       */
      setFocus(object, centered = false) {
        // if we're at the right edge of the viewport
        if (
          this.x > (this.width * .6) - this.offsetX
          && object.x >= this.x
        ) {
          this.screenPushX = this.width * .6;
          this.offsetX = this.screenPushX - this.x;
        }

        // left edge
        if (
          this.x < (this.width * .4) - this.offsetX
          && object.x <= this.x
        ) {
          this.screenPushX = this.width * .4;
          this.offsetX = this.screenPushX - this.x;
        }

        // top edge
        if (
          this.y < (this.height * .4) - this.offsetY
          && object.y <= this.y
        ) {
          this.screenPushY = this.height * .4;
          this.offsetY = this.screenPushY - this.y;
        }

        // bottom edge
        if (
          this.y > (this.height * .6) - this.offsetY
          && object.y >= this.y
        ) {
          this.screenPushY = this.height * .6;
          this.offsetY = this.screenPushY - this.y;
        }

        if (centered) {
          this.x = object.x;
          this.y = object.y;
          this.screenPushX = this.width / 2;
          this.screenPushY = this.height / 2;
          this.offsetX = Math.round(this.width / 2 - this.x);
          this.offsetY = Math.round(this.height / 2  - this.y);
        } else {
          // convert floats to integers
          this.offsetX = Math.round(this.offsetX);
          this.offsetY = Math.round(this.offsetY);
        }

        // update this
        this.x = object.x;
        this.y = object.y;
      }

      /**
       * Checks if a set of coords is inside the camera viewport
       * Note: the viewport is not 1:1 with what is visible, it is larger
       *
       * @param {*} x1
       * @param {*} y1
       * @param {*} x2
       * @param {*} y2
       * @returns
       * @memberof Camera
       */
      inViewport(x1, y1, x2, y2) {
        // calc the viewport
        const vpX1 = this.x - this.width;
        const vpX2 = this.x + this.width;
        const vpY1 = this.y - this.height;
        const vpY2 = this.y + this.height;

        // if in viewport
        if (
          x2 > vpX1
          && x1 < vpX2
          && y2 > vpY1
          && y1 < vpY2
        ) {
          return true;
        }

        // if not in viewport
        return false;
      }
    }

    /**
     * Creates a canvas and provides methods for drawing to it
     * @class Canvas
     */
    class Canvas {
      constructor(args = {}) {
        // set constants
        this.width = 1024;
        this.height = 640;

        // for consistent spacing off the canvas edge
        this.padding = 24;

        // generate all the <canvas> elements
        this.generateLayers();

        // generate object caches
        this.generateObjectCaches();

        // set a default ctx
        this.ctx = this.primaryLayer.context;
        
        // camera
        this.Camera = new Camera(this.width, this.height);
      }

      /**
       * Generates all the layers, called in constructor
       *
       * @memberof Canvas
       */
      generateLayers() {
        // create the canvas container div
        this.canvasDiv = {};
        this.canvasDiv.element = document.createElement('div');    this.canvasDiv.element.setAttribute('style', `width: ${this.width}px; height: ${this.height}px; background: #FFFFFF;`);
        this.canvasDiv.element.id = 'domParent';
        document.body.appendChild(this.canvasDiv.element);

        this.layers = [];
        this.canvasId = 0;

        // create canvas layers
        this.createLayer('background', { appendTo: this.canvasDiv.element });
        this.createLayer('primary', { appendTo: this.canvasDiv.element });
        this.createLayer('character', { appendTo: this.canvasDiv.element });
        this.createLayer('secondary', { appendTo: this.canvasDiv.element });
        this.createLayer('override', { appendTo: this.canvasDiv.element });
        this.createLayer('shadow', { appendTo: this.canvasDiv.element });
        this.createLayer('hud', { appendTo: this.canvasDiv.element });
        this.createLayer('menu', { appendTo: this.canvasDiv.element });
        this.createLayer('debug', { appendTo: this.canvasDiv.element });

        // get explicit reference to debug layer
        this.debugLayer = this.getLayerByName('debug');
        this.debugKeys = [];
        this.debugText = [];

        // primary, secondary, override
        this.primaryLayer = this.getLayerByName('primary');
        this.secondaryLayer = this.getLayerByName('secondary');
        this.overrideLayer = this.getLayerByName('override');

        // get reference to shadow layer
        this.shadowLayer = this.getLayerByName('shadow');
      }

      /**
       * Generates all object types
       *
       * @memberof Canvas
       */
      generateObjectCaches() {

      }

      /**
       * Sets this.ctx to a layer's context by its name
       *
       * @param {*} layerName
       * @memberof Canvas
       */
      setContext(layerName) {
        const layer = this.getLayerByName(layerName);
        this.ctx = layer.context;
      }

      /**
       * Gets a layer by name
       *
       * @param {*} name
       * @returns {Layer}
       * @memberof Canvas
       */
      getLayerByName(name) {
        const layer = this.layers.filter(layer => layer.name === name)[0];
        return layer;
      }
      
      /**
       * Creates a new canvas layer
       *
       * @param {*} name
       * @param {*} [args={}]
       * @memberof Canvas
       */
      createLayer(name, args = {}) {
        // assign a unique id
        this.canvasId++;
        const id = `canvas-${this.canvasId}`;

        // get width/height
        const width = (typeof args.width === 'undefined') ? this.width : args.width;
        const height = (typeof args.height === 'undefined') ? this.height : args.height;

        // context
        const context = (typeof args.context === 'undefined') ? '2d' : args.context;

        // visible
        const visible = (typeof args.visible === 'undefined') ? true : args.visible;

        // add 'er to the stack
        this.layers.push(new Layer(id, {
          name,
          width,
          height,
          context,
          visible,
        }));
      }

      /**
       * Clears a canvas
       * @memberof Canvas
       */
      clear(index) {
        const layer = this.layers[index];
        const ctx = layer.context;
        ctx.clearRect(0, 0, layer.width, layer.height);
      }

      /**
       * Clear a layer by its name
       *
       * @param {*} layerName
       * @memberof Canvas
       */
      clearLayer(layerName) {
        this.getLayerByName(layerName).clear();
      }

      /**
       * Clear an array of layers
       *
       * @param {array} layers
       * @memberof Canvas
       */
      clearLayers(layers) {
        for (let i = 0; i < layers.length; i++) {
          this.getLayerByName(layers[i]).clear();
        }
      }

      /**
       * Draws text to the canvas
       * @param {string} txt
       * @param {integer} x
       * @param {integer} y
       * @param {string} [font='32px Arial']
       * @param {string} [fillStyle='#FFFFFF']
       * @memberof Canvas
       */
      drawText(txt, x, y, font = '32px Arial', fillStyle = '#FFFFFF') {
        this.ctx.font = font;
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillText(txt, x, y);
      }

      pushDebugText(key, text) {
        if (this.debugKeys.indexOf(key) === -1) {
          this.debugKeys.push(key);
        }
        this.debugText[key] = text;
      }

      /**
       * Draws debug text
       * @param {string} txt
       * @memberof Canvas
       */
      drawDebugText(txt) {
        this.debugLayer.context.font = "18px Arial";
        this.debugLayer.context.fillStyle = 'white';
        this.debugKeys.forEach((key, i) => {
          this.debugLayer.context.fillText(this.debugText[key], this.padding, this.height - this.padding - i * 18);
        });
      }

      /**
       * Draws a circle
       *
       * @param {*} args
       * @memberof Canvas
       */
      drawCircle(args) {
        // offset for camera
        const x = args.x + this.Camera.offsetX;
        const y = args.y + this.Camera.offsetY;
        const radius = args.radius;

        // draw
        this.ctx.fillStyle = args.fillStyle;
        this.ctx.beginPath();
        this.ctx.arc(
          x,
          y,
          radius,
          args.startAngle,
          args.endAngle,
          args.anticlockwise,
        );
        this.ctx.fill();
        // this.ctx.strokeStyle = '#500050';
        // this.ctx.lineWidth = 1;
        // this.ctx.stroke();
        this.ctx.closePath();
      }

      drawDebugLine(p1, p2) {
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(300,150);
        ctx.stroke();
      }

      drawMap(image) {
        this.ctx.drawImage(image, this.Camera.offsetX, this.Camera.offsetY);
      }

      drawTile(tile) {
        // draw the tile
        const x = tile.xPixel + this.Camera.offsetX;
        const y = tile.yPixel + this.Camera.offsetY;

        this.ctx = this.primaryLayer.context;
        switch (tile.type) {
          case 'rock':
            this.ctx = this.overrideLayer.context;
            this.ctx.fillStyle = '#888787';
            this.ctx.strokeStyle = '#464242';
            break;

          case 'tree':
            this.ctx.fillStyle = '#008000';
            this.ctx.strokeStyle = '#063c06';
            break;
          
          case 'desert':
            this.ctx.fillStyle = '#e2c55a';
            this.ctx.strokeStyle = '#d0ab25';
            break;

          case 'water':
            this.ctx.fillStyle = 'blue';
            break;

          case 'grass':
          default:
            this.ctx.fillStyle = '#008000';
            this.ctx.strokeStyle = '#063c06';
            break;
        }

        if (tile.type === 'torch') {
          this.ctx = this.primaryLayer.context;
          this.drawCircle({
            x: tile.x + 25,
            y: tile.y + 25,
            radius: 5,
            fillStyle: 'rgba(255, 155, 0, .5)',
            startAngle: Math.PI / 180 * 0,
            endAngle: Math.PI / 180 * 360,
            anticlockwise: false,
          });
        }

        if (tile.type === 'tree') {
          this.ctx.fillRect(x, y, tile.width, tile.height);
          this.ctx = this.secondaryLayer.context;
          this.drawCircle({
            x: tile.x + 25,
            y: tile.y + 25,
            radius: 15,
            fillStyle: 'brown',
            startAngle: Math.PI / 180 * 0,
            endAngle: Math.PI / 180 * 360,
            anticlockwise: false,
          });
          this.drawCircle({
            x: tile.x + 25,
            y: tile.y + 25,
            radius: 50,
            fillStyle: 'rgba(40, 202, 0, .8)',
            startAngle: Math.PI / 180 * 0,
            endAngle: Math.PI / 180 * 360,
            anticlockwise: false,
          });
        } else {
          this.ctx.fillRect(x, y, tile.width, tile.height);
        }

        this.ctx = this.primaryLayer.context;
      }

      /**
       * Calculates the starting x pos to center a string
       * @param {string} text the text to be measured
       * @param {string} font canvas context font
       * @returns {integer} x coordinate
       * @memberof Canvas
       */
      calcCenteredTextX(text, font) {
        this.ctx.font = font;
        const width = this.ctx.measureText(text).width;
        return (this.width / 2 - width / 2);
      }

      /**
       * Calculates x position for an array of strings to be stacked centered and left justified
       * @param {array} txtArr
       * @param {string} [font='32px Arial']
       * @returns {integer} x coordinate
       * @memberof Canvas
       */
      calcCenteredTextBoxX(txtArr, font = '32px Arial') {
        // set the font size to calculate with
        this.ctx.font = font;

        // get the width of each string
        const strWidthArr = txtArr.map(txt => this.ctx.measureText(txt).width);

        // get the longest width
        const longest = strWidthArr.reduce((a, b) => Math.max(a, b));

        // calculate and return x
        return (this.width / 2) - (longest / 2);
      }

      /**
       * Calculates text width
       * @param {*} txt
       * @param {*} font
       * @returns
       * @memberof Canvas
       */
      calcTextWidth(txt, font) {
        this.ctx.font = font;
        return this.ctx.measureText(txt).width;
      }

      /**
       * Draws a black gradient across the entire canvas
       * @memberof Canvas
       */
      drawGradientBackground() {
        const grd = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        grd.addColorStop(0, '#333333');
        grd.addColorStop(1, '#000000');
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.width, this.height);
      }
    }

    /**
     * A text object for the canvas to display
     *
     * @class ObjectText
     */
    class ObjectText {
      constructor(args) {
        this.args = args;
        this.text = args.text;
        this.x = args.x;
        this.y = args.y;
        this.font = (typeof args.font !== 'undefined') ? args.font : '32px Arial';
        this.fillStyle = (typeof args.fillStyle !== 'undefined') ? args.fillStyle : '#FFFFFF';
        this.id = (typeof args.id !== 'undefined') ? args.id : null;
      }

      /**
       * Draws the text object using the canvas drawText method
       *
       * @param {Canvas} Canvas
       * @memberof ObjectText
       */
      draw(Canvas) {
        Canvas.drawText(this.text, this.x, this.y, this.font, this.fillStyle);
      }

      /**
       * Set the X coord
       *
       * @param {integer} x
       * @memberof ObjectText
       */
      setX(x) {
        this.x = x;
      }

      /**
       * Set the Y coord
       *
       * @param {integer} y
       * @memberof ObjectText
       */
      setY(y) {
        this.y = y;
      }
    }

    /**
     * Extends the ObjectText with a callback method
     *
     * @class ObjectTextInteractive
     * @extends {ObjectText}
     */
    class ObjectTextInteractive extends ObjectText {
      callback() {
        this.args.callback();
      }
    }

    /**
     * Draws a circle to the Canvas
     *
     * @class ObjectCircle
     */
    class ObjectCircle {
      constructor(args, game) {    
        // access to the game object
        this.game = game;

        this.args = args;
        this.x = args.x;
        this.y = args.y;
        this.radius = args.radius;
        this.fillStyle = args.fillStyle;
        this.startAngle = Math.PI / 180 * 0;
        this.endAngle = Math.PI / 180 * 360;
        this.anticlockwise = false;

        this.init(args.map);
      }

      draw(Canvas) {
        Canvas.drawCircle({
          fillStyle: this.fillStyle,
          x: this.x,
          y: this.y,
          radius: this.radius,
          startAngle: this.startAngle,
          endAngle: this.endAngle,
          anticlockwise: this.anticlockwise,
        });
      }
    }

    class ObjectMenu {
      /**
       * Creates an instance of ObjectMenu.
       * @param {*} args
       * @memberof ObjectMenu
       */
      constructor(args, game) {
        // default to having focus
        this.hasFocus = true;
        
        // reference to the game object
        this.game = game;

        // the arrow indicator symbol
        const arrowText = ')';

        // calculate the menu starting x position.
        this.startX = this.game.Canvas.calcCenteredTextBoxX(args.options.map(option => `${option.text}`));

        // create the option objects
        this.createOptionObjects(args.options);

        // set the focus menu object to the first one.
        this.focusMenuObject = this.options[0];

        // create the arrow
        this.createArrow(arrowText);

        // update the start x to accommodate for the arrow
        this.startX = this.startX + (this.arrow.width + this.arrow.padding) / 2;
      }

      /**
       * Sets focus on the menu.
       * this.hasFocus means Arrow keys will change the selected menu item.
       * @param {boolean} [hasFocus=true]
       * @memberof ObjectMenu
       */
      setFocus(hasFocus = true) {
        this.hasFocus = hasFocus;
      }

      /**
       * Creates the menu item option Objects
       * @param {*} options
       * @memberof ObjectMenu
       */
      createOptionObjects(options) {
        this.options = options.map((option, i) => this.game.Objects.create({
          ...option,
          type: 'textInteractive',
          x: this.startX,
          y: (this.game.Canvas.height / 2) - 55 + (i * 55),
        }));
      }

      /**
       * Creates the arrow indicator
       *
       * @param {*} text
       * @param {string} [font='44px Arial']
       * @memberof ObjectMenu
       */
      createArrow(text, font = '44px Arial') {
        // get the width to offset from the menu items
        const width = this.game.Canvas.calcTextWidth(text, font);

        // get the current focus object
        // const focusMenuObject = this.getFocusMenuObject();
        
        // create the object
        this.arrow = this.game.Objects.create({
          type: 'text',
          text,
          font,
          padding: 12,
          x: this.startX - width - 12,
          y: this.focusMenuObject.y,
          width,
        });
      }

      /**
       * Gets the array index of the focused menu option by its id
       *
       * @param {*} id
       * @returns
       * @memberof ObjectMenu
       */
      getFocusMenuObjectIndexById(id) {
        return this.options.map(option => option.id).indexOf(id);
      }

      /**
       * Increments the current focused menu item
       *
       * @memberof SceneMainMenu
       */
      incrementFocusMenuObject() {
        // get the focused menu object's index in the option array
        const index = this.getFocusMenuObjectIndexById(this.focusMenuObject.id);

        // increment it or start back at the beginning
        this.focusMenuObject = index === (this.options.length - 1)
          ? this.options[0]
          : this.options[index + 1];
            
        // update the arrow position
        this.arrow.y = this.focusMenuObject.y;
      }

      /**
       * Decrements the current focused menu item
       *
       * @memberof SceneMainMenu
       */
      decrementFocusMenuObject() {
        // get the focused menu object's index in the option array
        const index = this.getFocusMenuObjectIndexById(this.focusMenuObject.id);

        // increment it or start back at the beginning
        this.focusMenuObject = index === 0
          ? this.options[this.options.length - 1]
          : this.options[index - 1];
            
        // update the arrow position
        this.arrow.y = this.focusMenuObject.y;
      }

      /**
       * Draws the menu
       *
       * @memberof ObjectMenu
       */
      draw() {
        // set the Canvas context to the menu layer
        this.game.Canvas.setContext('menu');
        this.options.forEach(option => option.draw(this.game.Canvas));

        if (this.hasFocus) {
          this.arrow.draw(this.game.Canvas);
        }
      }
    }

    class Hero extends ObjectCircle {
      init(map) {
        // display debug info about the hero
        this.debug = true;

        // provide access to the map
        this.map = map;

        // allows keyboard input to the character
        this.allowInput = true;

        // if the hero can move in a certain direction
        // [ up, right, down, left ];
        this.canMove = [true, true, true, true];

        // handle character's directional velocity
        this.velocities = [0, 0, 0, 0];
        this.maxSpeed = 18; 
        this.rateOfIncrease = 1 + this.maxSpeed / 100;
        this.rateOfDecrease = 1 + this.maxSpeed;

        // set target x,y for easing the character movement
        this.targetX = this.x;
        this.targetY = this.y;
        this.targetXTimer;
        this.targetYTimer;

        // cooldown beteween movement
        this.inputCooldown = 30;

        // start the hero at a random location
        this.moveToRandomLocation();
      }

      /**
       * Gets a random x/y coord
       *
       * @memberof Hero
       */
      moveToRandomLocation() {
        // get random pixel coords
        const x = Math.round(Math.random() * this.map.widthInPixels);
        const y = Math.round(Math.random() * this.map.heightInPixels);

        // calculate visible tiles so we can check for collisions
        this.map.calculateVisibleTiles(x, y);

        // check if blocking
        // if it is, try again
        if (this.map.getCollision(x, y)) {
          return this.moveToRandomLocation();
        }

        // set the camera focus
        this.game.Canvas.Camera.setFocus({ x, y }, true);

        // remove movement easing, update position
        clearTimeout(this.targetXTimer);
        clearTimeout(this.targetYTimer);
        this.targetX = x;
        this.targetY = y;
        this.x = x;
        this.y = y;

        // tell the map to redraw
        this.map.needsUpdate = true;
      }

      /**
       * Currently draws a circle
       *
       * @param {*} Canvas
       * @memberof Hero
       */
      draw(Canvas) {
        Canvas.setContext('character');

        Canvas.drawCircle({
          fillStyle: this.fillStyle,
          x: this.x,
          y: this.y,
          radius: this.radius,
          startAngle: this.startAngle,
          endAngle: this.endAngle,
          anticlockwise: this.anticlockwise,
        });

        if (this.debug) {
          Canvas.pushDebugText('hero.maxSpeed', `Hero.maxSpeed: ${this.maxSpeed}`);
        }
      }

      /**
       * Increases the hero.maxSpeed
       *
       * @memberof Hero
       */
      increaseSpeed() {
        this.maxSpeed++;
      }

      /**
       * Decreases the hero.maxSpeed
       *
       * @memberof Hero
       */
      decreaseSpeed() {
        this.maxSpeed--;
      }

      /**
       * Handles easing on the X axis
       *
       * @param {*} dir
       * @param {*} this.map
       * @memberof Hero
       */
      targetXTimerHandler(dir) {
        // clear the existing timer
        clearTimeout(this.targetXTimer);

        // get the difference between the current y and the target y
        let difference = Math.abs(this.x - this.targetX);

        // set a new timer
        this.targetXTimer = setTimeout(() => {
          // calculate what the new x should be
          const newX = dir === 1 // right
            ? this.x + (difference / this.inputCooldown)
            : this.x - (difference / this.inputCooldown); 

          // handle collision
          const collision = this.map.getCollision(newX, this.y);

          if (collision) {
            this.targetX = this.x;
            difference = 0;
          } else {
            this.x = newX;
          }

          this.afterEaseMovement();

          // if we're not close enough to the target Y, keep moving
          if (difference > 1) {
            this.targetXTimerHandler(dir, this.map);
          }
        }, difference / this.inputCooldown);
      }

      /**
       * Handles easing on the Y axis
       *
       * @param {*} dir
       * @memberof Hero
       */
      targetYTimerHandler(dir) {
        // clear the existing timer
        clearTimeout(this.targetYTimer);

        // get the difference between the current y and the target y
        let difference = Math.abs(this.y - this.targetY);

        // set a new timer
        this.targetYTimer = setTimeout(() => {
          // handle direction
          const newY = dir === 0 // up
            ? this.y - (difference / this.inputCooldown)
            : this.y + (difference / this.inputCooldown);

          // handle collision
          const collision = this.map.getCollision(this.x, newY);

          if (collision) {
            this.targetY = this.y;
            difference = 0;
          } else {
            this.y = newY;
          }

          this.afterEaseMovement();

          // if we're not close enough to the target Y, keep moving
          if (difference > 1) {
            this.targetYTimerHandler(dir, this.map);
          } else {
            this.map.needsUpdate = false;
          }
        }, difference / this.inputCooldown);
      }

      /**
       * Additional actions to perform after movement easing is calculated
       *
       * @memberof Hero
       */
      afterEaseMovement() {
        // calculate
        this.game.Canvas.Camera.setFocus({
          x: this.x,
          y: this.y,
        });

        this.map.needsUpdate = true;
      }

      /**
       * Handle input for the hero
       *
       * @param {*} activeKeys
       * @param {*} this.map
       * @returns
       * @memberof Hero
       */
      handleInput(Keyboard) {
        // bail if input is disabled
        if (!this.allowInput) {
          return;
        }

        if (Keyboard.active.plus) {
          this.increaseSpeed();
        }

        if (Keyboard.active.minus) {
          this.decreaseSpeed();
        }

        // loop through each directions
        for (let i = 0; i < Keyboard.directions.length; i++) {
          // is the direction active?
          const active = Keyboard.directions[i];

          // if direction is active
          if (active) {
            this.canMove[i] = false;
            
            // make it faster
            this.velocities[i] = this.velocities[i] >= this.maxSpeed
              ? this.maxSpeed
              : (this.velocities[i] + 1) * this.rateOfIncrease;
            
            // y axis
            if (i === 0 || i === 2) {
              // opposite directions cancel eachother out
              if (!(Keyboard.active.up && Keyboard.active.down)) {
                this.targetY = i === 0
                  ? this.y - this.velocities[i] // up
                  : this.y + this.velocities[i]; // down
                
                this.targetYTimerHandler(i);
              } else {
                this.velocities[i] = 0;
              }
            }

            // x axis
            if (i === 1 || i === 3) {
              // opposite directions cancel eachother out
              if (!(Keyboard.active.left && Keyboard.active.right)) {
                this.targetX = i === 1
                  ? this.x + this.velocities[i] // right
                  : this.x - this.velocities[i]; // left
                
                this.targetXTimerHandler(i);
              } else {
                this.velocities[i] = 0;
              }
            }
          } else {
            // nuke velocity if not active
            this.velocities[i] = 0;
          }
        }
        
        // set timeout to enable movement in the direction
        clearTimeout(this.keyboardCooldownTimer);
        this.keyboardCooldownTimer = setTimeout(() => {
          this.canMove = [true, true, true, true];
        }, this.inputCooldown);
      }
    }

    class Shadows {
      constructor(Canvas, origin, objects) {
        this.Canvas = Canvas;

        // set the context to the shadow layer
        this.ctx = this.Canvas.shadowLayer.context;

        // origin point where lighting is based off of, which is always the hero x/y
        this.origin = {
          x: origin.x,
          y: origin.y,
        };

        // get all blocking objects
        this.blocks = [];
        this.lights = [];

        for (let i = 0; i < objects.length; i++) {
          const object = objects[i];
          const x1 = object.xPixel;
          const y1 = object.yPixel;
          const block = {
            x1: object.xPixel,
            y1: object.yPixel,
            x2: object.xPixel + object.width,
            y2: object.yPixel + object.height,
            width: object.width,
            height: object.height,
          };
          this.blocks.push(block);
        }

        // TODO: All blocks currently have shadow,
        // TODO: Add light handling
        // if (object.light === true) {
        //   this.lights.push(obj);
        // }
      }

      draw() {
        this.Canvas.shadowLayer.clear();

        // get the camera offset
        const offsetX = this.Canvas.Camera.offsetX;
        const offsetY = this.Canvas.Camera.offsetY;

        this.ctx.globalCompositeOperation = 'source-over';

        // gradient 1
        const grd = this.ctx.createRadialGradient(
          this.origin.x + offsetX,
          this.origin.y + offsetY,
          0,
          this.origin.x + offsetX,
          this.origin.y + offsetY,
          360
        );
        
        grd.addColorStop(0, 'rgba(0, 0, 0, .1)');
        grd.addColorStop(0.9, 'rgba(0, 0, 0, .5');
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

        // gradient 2
        this.ctx.globalCompositeOperation = 'source-over';
        const grd2 = this.ctx.createRadialGradient(
          this.origin.x + offsetX,
          this.origin.y + offsetY,
          0,
          this.origin.x + offsetX,
          this.origin.y + offsetY,
          360
        );
        grd2.addColorStop(0, 'rgba(0, 0, 0, .1)');
        grd2.addColorStop(0.9, 'rgba(0, 0, 0, 1');
        this.ctx.fillStyle = grd2;
        this.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

        // lights
        this.ctx.globalCompositeOperation = 'destination-out';
        this.lights.forEach(light => {
          const gradient = this.ctx.createRadialGradient(
            light.x1 + offsetX + light.width / 2,
            light.y1 + offsetY + light.height / 2,
            0,
            light.x1 + offsetX + light.width / 2,
            light.y1 + offsetY + light.height / 2,
            100
          );
          gradient.addColorStop(0, `rgba(0, 0, 0, ${Math.random() + .7})`);
          gradient.addColorStop(0.9, 'rgba(0, 0, 0, 0');
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(
            light.x1 + offsetX - 100 + light.width / 2,
            light.y1 + offsetY - 100 + light.height / 2,
            200,
            200
          );
        });

        // object shadows
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = '1px';

        for (let i = 0; i < this.blocks.length; i++) {
          const pos = this.blocks[i];

          // get all 4 corners
          const points = [
            { x: pos.x1, y: pos.y1 },
            { x: pos.x2, y: pos.y1 },
            { x: pos.x1, y: pos.y2 },
            { x: pos.x2, y: pos.y2 },
          ];

          this.drawShadows(points, pos, offsetX, offsetY);
        }
      }

      drawShadows(points, pos, offsetX, offsetY) {
        
        this.ctx.globalCompositeOperation = 'source-over';
        
        // calculate the angle of each line
        const raw = points.map(point => Object.assign({}, point, {
          angle: this.calculateAngle(point),
          distance: this.calculateDistance(point),
        }));

        const minMaxDistance = 500;

        const angles = raw.slice(0).sort((a, b) => {
          // sort by angle
          if (b.angle > a.angle) {
            return 1;
          }

          if (b.angle < a.angle) {
            return -1;
          }

          return 0;
        });

        const furthest = raw.slice(0).sort((a, b) => {
          // sort by angle
          if (b.distance > a.distance) {
            return 1;
          }

          if (b.distance < a.distance) {
            return -1;
          }

          return 0;
        });
        
        // TODO: Don't read this next block of code
        // TODO: it's just a bunch of spaghett
        this.ctx.fillStyle = `rgb(0, 0, 0)`;
        this.ctx.beginPath();
        if (
          this.origin.x > pos.x2
          && this.origin.y > pos.y1
          && this.origin.y < pos.y2
        ) {
          let min = this.calculatePoint(angles[2].angle, minMaxDistance);
          let max = this.calculatePoint(angles[1].angle, minMaxDistance);
          this.ctx.moveTo(angles[1].x + offsetX, angles[1].y + offsetY);
          this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
          this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
          this.ctx.lineTo(angles[2].x + offsetX, angles[2].y + offsetY);
          if (this.origin.y > pos.y1 + pos.width / 2) {
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
          } else {
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
          }
          this.ctx.lineTo(angles[1].x + offsetX, angles[1].y + offsetY);
        } else {
          if (
            this.origin.y > pos.y1
            && this.origin.y < pos.y2
          ) {
            // handle being left of the object
            const max = this.calculatePoint(angles[0].angle, minMaxDistance);
            const min = this.calculatePoint(angles[3].angle, minMaxDistance);
            this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
            this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
            this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
            this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
            if (this.origin.y > pos.y1 + pos.width / 2) {
              this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
              this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
            } else {
              this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
              this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            }
            this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
          } else if ( // above/beneath object
            this.origin.x > pos.x1
            && this.origin.x < pos.x2
          ) {
            // below the object
            if (this.origin.y > pos.y1) {
              // below the object
              const max = this.calculatePoint(angles[0].angle, minMaxDistance);
              const min = this.calculatePoint(angles[3].angle, minMaxDistance);
              this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
              this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
              this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
              this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
              if (this.origin.x > pos.x1 + pos.width / 2) {
                this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
                this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
              } else {
                this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
                this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
              }
              this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
            } else { // above the object
              // below the object
              const max = this.calculatePoint(angles[0].angle, minMaxDistance);
              const min = this.calculatePoint(angles[3].angle, minMaxDistance);
              this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
              this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
              this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
              this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
              if (this.origin.x > pos.x1 + pos.width / 2) {
                this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
                this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
              } else {
                this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
                this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
              }
              this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
            }
          } else { // northwest of object
            const max = this.calculatePoint(angles[0].angle, minMaxDistance);
            const min = this.calculatePoint(angles[3].angle, minMaxDistance);
            this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
            this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
            this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
            this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
          }
        }
        this.ctx.closePath();
        this.ctx.fill();
      }

      /**
       * Calculates the angle between 2 points
       *
       * @param {*} point
       * @param {*} [origin={ x: this.origin.x, y: this.origin,y }]
       * @returns
       * @memberof Shadows
       */
      calculateAngle(point, origin = { x: this.origin.x, y: this.origin.y }) {
        return Math.atan2(point.y - origin.y, point.x - origin.x) * 180 / Math.PI;
      }

      /**
       * Calculates a new point given an angle, distance from, and starting point
       *
       * @param {*} angle
       * @param {*} distance
       * @returns {object} x, y
       * @memberof Shadows
       */
      calculatePoint(angle, distanceFrom, point = { x: this.origin.x, y: this.origin.y }) {
        return {
          x: Math.round(Math.cos(angle * Math.PI / 180) * distanceFrom + point.x),
          y: Math.round(Math.sin(angle * Math.PI / 180) * distanceFrom + point.y),
        };
      }

      /**
       * Calculate the distance between two points
       * AKA Pythagorean theorem
       *
       * @param {*} pos1
       * @param {*} pos2
       * @returns
       * @memberof Shadows
       */
      calculateDistance(pos1, pos2 = { x: this.origin.x, y: this.origin.y }) {
        const a = pos1.x - pos2.x;
        const b = pos1.y - pos2.y;

        // return the distance
        return Math.sqrt(a * a + b * b);
      }
    }

    // create references to the most used default tile types

    /**
     * Provides utility methods for tiles
     *
     * @class TileUtil
     */
    class TileUtil {
      /**
       * Creates an instance of TileUtil.
       * @param {number} [tileInt=0]
       * @memberof TileUtil
       */
      constructor(args) {
        // width of tiles in pixels
        this.tileWidth = args.tileWidth;
        this.tileHeight = args.tileHeight;

        // max x / y positions
        this.xMax = args.xMax;
        this.yMax = args.yMax;

        // define substr positions for extracting tile data
        this.substr = {
          type: 1,
          blocking: 2,
          light: 3,
          shadow: 4,
          x: 5,
          y: 5 + this.xMax,
        };
      }

      /**
       * Creates a map tile
       *
       * @param {*} args
       * @returns
       * @memberof TileUtil
       */
      create(args = {}) {
        // defaults
        let type = 0;
        let blocking = 0;
        let light = 0;
        let shadow = 0;

        // randomize the tile type
        let random = Math.random();
        if (random > .1) {
          type = 0; // grass
        } else if (random > .08) {
          type = 1; // water;
          blocking = 1;
        } else {
          type = 2; // rock
          blocking = 1;
          shadow = 1;
        }

        // null is 0 bytes, woohoo! (grass)
        if (type === 0) {
          return null;
        }

        // (water)
        if (type === 1) {
          return '1';
        }

        // '' is 0 bytes too, woohoo (rock)
        if (type === 2) {
          return '';
        }

        // create and return the string
        const string = '1' + type + '' + blocking + '' + light + '' + shadow + '';
        return Number(string);
      }

      /**
       * Converts a packed tile integer into a verbose object
       *
       * @param {*} int
       * @returns
       * @memberof TileUtil
       */
      unpack(int) {
        // if int is not an int, it's an aliased value
        if (typeof int !== 'number') {
          // TODO: Look into why i have to explicitly do this and can't use reference array
          if (int === null) return {
            type: 'grass',
            blocking: false,
            shadow: false,
            light: false,
          };

          if (int === '1') return {
            type: 'water',
            blocking: true,
            shadow: false,
            light: false,
          }

          if (int === '') return {
            type: 'rock',
            blocking: true,
            shadow: true,
            light: false,
          }
        }

        // convert the int to a string
        const raw = this.toString(int);

        // get the properties
        const type = tileTypes[raw.substr(this.substr.type, 1)].type;
        const blocking = Number(raw.substr(this.substr.blocking, 1)) === 1;
        const light = Number(raw.substr(this.substr.light, 1)) === 1;
        const shadow = Number(raw.substr(this.substr.shadow, 1)) === 1;
        // const x = Number(raw.substr(this.substr.x, this.xMax));
        // const y = Number(raw.substr(this.substr.y, this.yMax));
        // const xPixel = x * this.tileWidth;
        // const yPixel = y * this.tileHeight;
        // const width = this.tileWidth;
        // const height = this.tileHeight;

        const tile = {
          type,
          blocking,
          light,
          shadow,
          // x,
          // y,
          // xPixel,
          // yPixel,
          // width,
          // height,
        };

        return tile;
      }

      /**
       * Converts an int to string
       *
       * @param {*} int
       * @returns
       * @memberof TileUtil
       */
      toString(int) {
        return int + "";
      }

      /**
       * Get the type integer
       *
       * @returns {integer} type
       * @memberof TileUtil
       */
      typeInt(int) {
        return Number(this.toString(int).substr(this.substr.type, 1));
      }

      /**
       * Get the human readable tile type
       *
       * @returns
       * @memberof TileUtil
       */
      typeText(int) {
        const index = this.typeInt(int);
        return tileTypes[index].type;
      }

      /**
       * Get the X map position
       *
       * @returns
       * @memberof TileUtil
       */
      // x(int) {
      //   const x = Number(this.toString(int).substr(this.substr.x, this.xMax));
      //   return x;
      // }

      /**
       * * Get the Y map position
       *
       * @returns
       * @memberof TileUtil
       */
      // y(int) {
      //   const y = Number(this.toString(int).substr(this.substr.y, this.yMax));
      //   return y;
      // }

      /**
       * Check if the tile is blocking
       *
       * @returns {boolean} is blocking
       * @memberof TileUtil
       */
      blocking(int) {
        return Number(this.toString(int).substr(this.substr.blocking, 1)) === 1;
      }

      /**
       * Check if the tile casts a shadow
       *
       * @returns
       * @memberof TileUtil
       */
      shadow(int) {
        return Number(this.toString(int).substr(this.substr.shadow, 1)) === 1;
      }
    }

    class Map {
      constructor(args, game) {
        this.game = game;

        // map width and height in tiles
        this.xTotalTiles = 5000;
        this.yTotalTiles = 5000;
        
        // total amount of tiles
        this.totalTiles = this.xTotalTiles * this.yTotalTiles;

        // single tile width and height in pixels
        this.tileWidth = 50;
        this.tileHeight = 50;

        // get the width and height of the map in total pixels
        this.widthInPixels = this.xTotalTiles * this.tileWidth;
        this.heightInPixels = this.yTotalTiles * this.tileHeight;

        // stores the data about what exists at a particular position
        this.mapArray = [];

        // keep track of visible tiles
        this.visibleTilesPerDirection = 8;
        this.visibleTileArray = [];
        this.visibleTileX = 0;
        this.visibleTileY = 0;

        // tile util needs to know:
        //  width/height of a tile in pixels
        //  x / y total tile length
        this.TileUtil = new TileUtil({
          tileWidth: this.tileWidth,
          tileHeight: this.tileHeight,
          xMax: this.xTotalTiles.toString().length,
          yMax: this.yTotalTiles.toString().length,
        });
      }

      /**
       * Converts x, y position to map array index
       *
       * @param {*} x
       * @param {*} y
       * @param {boolean} [convertPixels=false]
       * @returns
       * @memberof Map
       */
      convertPosToIndex(x, y, convertPixels = false) {
        let tileX = x;
        let tileY = y;
        
        if (convertPixels) {
          tileX = Math.round(x / this.tileWidth);
          tileY = Math.round(y / this.tileHeight);
        }

        const index = tileX + tileY * this.yTotalTiles;
        return index;
      }

      /**
       * Draws the map tiles and shawdows
       * only if the map needs an update
       *
       * @param {*} Canvas
       * @memberof Map
       */
      draw(Canvas) {
        if (this.needsUpdate) {
          // calculate the visible tiles
          this.calculateVisibleTiles();

          // draw the tiles
          for (var i = 0; i < this.visibleTileArray.length; i++) {
            Canvas.drawTile(this.visibleTileArray[i]);
          }

          // draw the shadows
          this.drawShadows();
        }
      }

      /**
       * Draws the shadows
       *
       * @memberof Map
       */
      drawShadows() {
        // get the origin
        const scene = this.game.scene;
        const origin = { x: scene.hero.x, y: scene.hero.y };

        // get the shadow objects
        const blocks = [];
        for (var i = 0; i < this.visibleTileArray.length; i++) {
          const tile = this.visibleTileArray[i];
          if (tile.shadow) {
            blocks.push(tile);
          }
        }

        // get and draw
        const shadows = new Shadows(this.game.Canvas, origin, blocks);
        shadows.draw();
      }

      /**
       * Gets the visible tile array based off x, y coords
       *
       * @param {*} x
       * @param {*} y
       * @memberof Map
       */
      calculateVisibleTiles(x = this.game.Canvas.Camera.x, y = this.game.Canvas.Camera.y) {    
        // get the pixel to tile number
        const tileX = Math.round(x / this.tileWidth);
        const tileY = Math.round(y / this.tileHeight);

        // bail if the tiles are the same as the last time
        if (
          this.visibleTileX === tileX
          && this.visibleTileY === tileY
        ) {
          return;
        }

        this.visibleTileX = tileX;
        this.visibleTileY = tileY;

        // get the bounds of the visible tiles
        let x1 = tileX - this.visibleTilesPerDirection;
        let x2 = tileX + this.visibleTilesPerDirection;
        let y1 = tileY - this.visibleTilesPerDirection;
        let y2 = tileY + this.visibleTilesPerDirection;

        // clamp the bounds
        if (x1 < 1) {
          x1 = 0;
        }
        if (x2 > this.xTotalTiles) {
          x2 = this.xTotalTiles;
        }
        if (y1 < 1) {
          y1 = 0;
        }
        if (y2 > this.yTotalTiles) {
          y2 = this.yTotalTiles;
        }

        // create visible tile array from the boundaries
        this.visibleTileArray = [];
        let visibleIndex = 0;
        for (let j = y1; j < y2; j++) {
          for (let i = x1; i < x2; i++) {
            // get the map array and visible array indexes
            const mapIndex = this.convertPosToIndex(i, j);

            // if the map array value is -1
            // then it has not been visible yet
            // create a tile at that index
            if (typeof this.mapArray[mapIndex] === 'undefined') {
              const tile = this.TileUtil.create();
              this.mapArray[mapIndex] = tile;
            }

            // add the x/y data to the object
            const visibleTile = this.TileUtil.unpack(this.mapArray[mapIndex]);
            visibleTile.x = i;
            visibleTile.y = j;
            visibleTile.xPixel = i * this.tileWidth;
            visibleTile.yPixel = j * this.tileHeight;
            visibleTile.width = this.tileWidth;
            visibleTile.height = this.tileHeight;

            // add the unpacked version of the tile to the visible tile array
            this.visibleTileArray[visibleIndex++] = visibleTile;
          }
        }
      }

      /**
       * Check if a coordinate is a collision and return the collision boundaries
       *
       * @param {*} x pixel position
       * @param {*} y pixel position
       * @returns
       * @memberof Map
       */
      getCollision(xPixel, yPixel) {
        // hardcode the hero
        const heroRadius = 20;
        const x1 = xPixel - heroRadius;
        const x2 = xPixel + heroRadius;
        const y1 = yPixel - heroRadius;
        const y2 = yPixel + heroRadius;
        
        // map boundaries
        if (
          x1 < 0
          || y1 < 0
          || x2 > this.widthInPixels
          || y2 > this.heightInPixels
        ) {
          return true;
        }

        // tile blocking
        for (let i = 0; i < this.visibleTileArray.length; i++) {
          const tile = this.visibleTileArray[i];
          if (tile.blocking) {
            if (
              x2 > tile.xPixel
              && x1 < tile.xPixel + tile.width
              && y2 > tile.yPixel
              && y1 < tile.yPixel + tile.height
            ) {
              return true;
            }
          }
        }

        // let 'em pass
        return false;
      }
    }

    /**
     * Handles Object creation for use in Scenes
     *
     * @class Objects
     */
    class Objects {
      constructor(game) {
        this.game = game;

        // Used as the object.id when creating new objects.
        // Increments after each usage.
        this.newObjectId = 0;
      }

      /**
       * Creates a new object
       *
       * @param {*} args
       * @returns A Scene Object
       * @memberof Objects
       */
      create(args) {
        // get a new object id
        this.newObjectId++;

        // create the new object args
        const object = Object.assign({}, args, {
          id: this.newObjectId,
        });

        switch (object.type) {
          case 'text':
            return new ObjectText(object)
            break;
          
          case 'textInteractive':
            return new ObjectTextInteractive(object);
            break;

          case 'circle':
            return new ObjectCircle(object);
            break;
          
          case 'menu':
            return new ObjectMenu(object, this.game);
            break;

          case 'hero':
            return new Hero(object, this.game);
            break;
          
          case 'map':
            return new Map(object, this.game);
            break;
          
          default:
            break;
        }

        return {};
      }
    }

    /**
     * Base helper class for canvas scenes
     *
     * @class Scene
     */
    class Scene {
      // constructor games the game object
      constructor(game) {
        // make the game instance available to the scene
        this.game = game;

        // easy access to the canvas and canvas context
        this.Canvas = this.game.Canvas;
        this.ctx = this.game.Canvas.ctx;

        // each access to the object factory
        this.Objects = this.game.Objects;

        // the scene contains objects to be drawn
        this.scene = [];

        // additional constructor actions for child classes
        this.init();
      }

      /**
       ** Should be declared by subclass
       *  called at the end of constructor
       *
       * @memberof Scene
       */
      init() {
        // hello from the other side
      }

      /**
       * Push an object to the scene
       *
       * @param {object} obj
       * @memberof Scene
       */
      pushToScene(obj) {
        this.scene.push(obj);
      }

      /**
       ** Should be declared by subclass
       *  What/where objects should be displayed
       *
       * @memberof Scene
       */
      prepareScene() {
        /* for example
        if (this.shouldShowObject) {
          this.pushToScene(this.obj);
        }
        */
      }

      /**
       * Calls the .draw() method of each object in the scene
       * 
       *
       * @memberof Scene
       */
      drawSceneToCanvas() {
        // draw each object in the scene
        this.scene.forEach(obj => {
          obj.draw(this.Canvas);
        });

        // clear the scene for the next frame
        this.scene = [];
      }

      /**
       * Draws the current scene
       * Called in the main game loop
       *
       * @memberof Scene
       */
      draw() {
        // push the scene objects to the scene array
        this.prepareScene();

        // call each object's draw method
        this.drawSceneToCanvas();
      }

      /**
       ** Should be overridden by subclass
       *  Clears the previous frame
       *
       * @memberof Scene
       */
      clear() {
        // hello from the other side
      }

      /**
       ** Should be overridden by subclass
       *  Handles input from keyboard/mouse
       *
       * @memberof Scene
       */
      handleInput() {
        // hello from the other side
      }

      /**
       * Handle scene transitions
       *
       * @memberof Scene
       */
      transitionIn() {
        // disable and reenable keyboard on scene transition
        this.game.Keyboard.setDisabled();
        this.game.Keyboard.clear();
        setTimeout(() => {
          this.game.Keyboard.setDisabled(false);
        }, 150);

        // do custom transition in effects
        this.transitionInCustom();
      }

      /**
       ** Should be overridden by subclass
       *  Give the scene a way to customize the transition in
       *
       * @memberof Scene
       */
      transitionInCustom() {
        // hello from the other side
      }

      /**
       * Transition out of the current scene
       *
       * @memberof Scene
       */
      transitionOut() {
        // default to clear all layers
        for (let i = 0; i < this.game.Canvas.layers.length; i++) {
          this.game.Canvas.layers[i].clear();
        }
      }
    }

    /**
     * The Main Menu scene
     *
     * @class SceneMainMenu
     * @extends {Scene}
     */
    class SceneMainMenu extends Scene {
      /**
       * Constructor
       *
       * @memberof SceneMainMenu
       */
      init() {
        // create the logo object
        this.createLogo();

        // create the menu objects
        // this.createMenuObjects();

        //
        this.createMenu();

        // keyboard input stuff
        this.allowInput = true;
        this.keyboardCooldown = 150;
        this.keyboardCooldownTimer;
      }

      /**
       * Creates the logo object
       *
       * @memberof SceneMainMenu
       */
      createLogo() {
        const text = 'Canvas Game Engine';
        const font = '44px Arial';
        this.logo = this.Objects.create({
          type: 'text',
          text,
          x: this.Canvas.calcCenteredTextX(text, font),
          y: 64 + this.Canvas.padding,
          font,
        });
      }

      /**
       * Creates the menu
       *
       * @memberof SceneMainMenu
       */
      createMenu() {
        this.menu = this.Objects.create({
          type: 'menu',
          options: [
            {
              text: 'New Game',
              callback: () => {
                this.game.setScene('game');
              },
            },
            {
              text: 'Continue',
              callback: () => {
                console.log('do Continue');
              },
            },
            {
              text: 'Options',
              callback: () => {
                console.log('do Options');
              },
            },
          ]
        });
      }

      /**
       * Clear the text layer
       *
       * @memberof SceneMainMenu
       */
      clear() {
        this.Canvas.getLayerByName('menu').clear();
      }

      /**
       * Loads the objects to the scene for drawing
       *
       * @memberof SceneMainMenu
       */
      prepareScene() {
        // draw the background
        this.Canvas.setContext('primary');
        this.Canvas.drawGradientBackground();

        this.Canvas.setContext('menu');

        // push the logo to the scene
        this.pushToScene(this.logo);

        // push the menu to the scene
        this.pushToScene(this.menu);
      }

      /**
       * Handle input for the scene
       *
       * @param {array} activeKeys
       * @returns {void}
       * @memberof SceneMainMenu
       */
      handleInput(Keyboard) {
        if (!this.allowInput) {
          return;
        }

        // handle up
        if (Keyboard.active.up) {
          // decrement the focused object
          this.menu.decrementFocusMenuObject();
          this.allowInput = false;
        }

        // handle down
        if (Keyboard.active.down) {
          // increment the focused object
          this.menu.incrementFocusMenuObject();
          this.allowInput = false;
        }

        // handle enter
        if (Keyboard.active.enter) {
          // do the menu item callback
          this.menu.focusMenuObject.callback();
          this.allowInput = false;
        }
        
        // set timeout to enable key press again
        window.clearTimeout(this.keyboardCooldownTimer);
        const that = this;
        this.keyboardCooldownTimer = window.setTimeout(function() {
          that.allowInput = true;
        }, this.keyboardCooldown);
      }

      transitionInCustom() {
        // TODO: fix this nonsense...
        this.game.Canvas.clearLayers(['menu', 'secondary', 'override', 'shadow']);
      }

      transitionOut() {
        // clear the menu layer
        this.game.Canvas.getLayerByName('menu').clear();
      }
    }

    class SceneGame extends Scene {
      init() {
        this.createMap();
        this.createHero();
      }

      createMap() {
        this.map = this.Objects.create({
          type: 'map',
        });
      }

      createHero() {
        this.hero = this.Objects.create({
          type: 'hero',
          x: 25,
          y: 25,
          radius: 25,
          fillStyle: '#800080',
          map: this.map,
        });

        // set focus to hero
        this.Canvas.Camera.x = this.hero.x;
        this.Canvas.Camera.y = this.hero.y;
        this.Canvas.Camera.setFocus(this.hero);
      }

      prepareScene() {
        this.pushToScene(this.map);
        this.pushToScene(this.hero);
      }

      clear() {
        // clear the primary layer
        if (this.map.needsUpdate) {
          this.Canvas.clearLayers(['primary', 'secondary', 'override', 'character']);
        }
      }

      /**
       * Handle input for the scene
       *
       * @param {array} activeKeys
       * @returns {void}
       * @memberof SceneMainMenu
       */
      handleInput(Keyboard) {
        // pause the game
        if (Keyboard.active.escape) {
          // cache the current scene in case we're just pausing
          this.game.sceneCache = this.game.scene;
          this.game.setScene('pause');
        }

        this.hero.handleInput(Keyboard, this.map);
      }

      transitionInCustom() {
        this.Canvas.setContext('primary');

        // do a draw
        this.map.needsUpdate = true;
      }

      // leave the game in the background cause it's pretty sweet looking
      transitionOut() {
        this.Canvas.clearLayers(['character']);
        // do nothing!
      }
    }

    /**
     * The Main Menu scene
     *
     * @class ScenePause
     * @extends {Scene}
     */
    class ScenePause extends Scene {
      /**
       * Constructor
       *
       * @memberof ScenePause
       */
      init() {
        // create the logo object
        this.createLogo();

        // create the menu items
        this.createMenu();

        // keyboard input stuff
        this.allowInput = true;
        this.keyboardCooldown = 150;
        this.keyboardCooldownTimer;
      }

      /**
       * Creates the logo object
       *
       * @memberof ScenePause
       */
      createLogo() {
        const text = 'Paused';
        const font = '44px Arial';
        this.logo = this.Objects.create({
          type: 'text',
          text,
          x: this.Canvas.calcCenteredTextX(text, font),
          y: 64 + this.Canvas.padding,
          font,
        });
      }

      /**
       * Creates the menu
       *
       * @memberof ScenePause
       */
      createMenu() {
        this.menu = this.Objects.create({
          type: 'menu',
          options: [
            {
              text: 'Resume',
              callback: () => {
                this.game.setScene(this.game.sceneCache);
              },
            },
            {
              text: 'Quit To Menu',
              callback: () => {
                this.game.setScene('mainMenu');
              },
            },
          ]
        });
      }

      /**
       * Clear the text layer
       *
       * @memberof SceneMainMenu
       */
      clear() {
        this.Canvas.getLayerByName('menu').clear();
      }

      /**
       * Loads the objects to the scene for drawing
       *
       * @memberof ScenePause
       */
      prepareScene() {
        // draw the background
        this.Canvas.setContext('primary');
        this.Canvas.drawGradientBackground();

        this.Canvas.setContext('menu');

        // push the logo to the scene
        this.pushToScene(this.logo);

        // push the menu to the scene
        this.pushToScene(this.menu);
      }

      /**
       * Handle input for the scene
       *
       * @param {Keyboard} Keyboard
       * @returns {void}
       * @memberof ScenePause
       */
      handleInput(Keyboard) {
        // bail if input is disabled
        if (!this.allowInput) {
          return;
        }

        // handle down
        if (Keyboard.active.down) {
          // increment the focused object
          this.menu.incrementFocusMenuObject();
          this.allowInput = false;
        }

        // handle up
        if (Keyboard.active.up) {
          // decrement the focused object
          this.menu.decrementFocusMenuObject();
          this.allowInput = false;
        }

        // handle enter
        if (Keyboard.active.enter) {
          // do the menu item callback
          this.menu.focusMenuObject.callback();
          this.allowInput = false;
        }

        // go back to game on escape
        if (Keyboard.active.escape) {
          this.game.setScene(this.game.sceneCache);
        }
        
        // set timeout to enable key press again
        window.clearTimeout(this.keyboardCooldownTimer);
        const that = this;
        this.keyboardCooldownTimer = window.setTimeout(function() {
          that.allowInput = true;
        }, this.keyboardCooldown);
      }

      // just clear the primary and background
      transitionOut() {
        const layersToClear = ['menu'];
        for (let i = 0; i < layersToClear.length; i++) {
          this.Canvas.getLayerByName(layersToClear[i]).clear();
        }
      }
    }

    var Scenes = {
      SceneMainMenu,
      SceneGame,
      ScenePause,
    };

    class KeyboardController {
      /**
       * Creates an instance of KeyboardController.
       * @memberof KeyboardController
       */
      constructor() {
        // if disabled, keyboard input will not register
        this.disabled = false;

        // raw keycodes
        this.keyCodes = {
          13: 'enter',
          16: 'shift',
          27: 'escape',
          32: 'space',
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down',
          49: 'one',
          50: 'two',
          51: 'three',
          52: 'four',
          53: 'five',
          54: 'six',
          55: 'seven',
          56: 'eight',
          57: 'nine',
          58: 'zero',
          65: 'a',
          68: 'd',
          83: 's',
          87: 'w',
          187: 'equals',
          189: 'minus',
        };

        // reference for keys that use shift
        // formatted as keyWihoutShift: keyWithShift
        this.shiftKeys = {
          equals: 'plus',
        };
        
        // human readable key states
        this.active = {
          enter: false,
          shift: false,
          escape: false,
          up: false,
          right: false,
          down: false,
          left: false,
          w: false,
          a: false,
          s: false,
          d: false,
          equals: false,
          minus: false,
          plus: false,
          zero: false,
          one: false,
          two: false,
          three: false,
          four: false,
          five: false,
          six: false,
          seven: false,
          eight: false,
          nine: false,
        };

        // alias keys
        // if these keys are pressed, they should also mark their aliased key as pressed
        this.aliasKeys = {
          w: 'up',
          a: 'left',
          s: 'down',
          d: 'right',
        };

        // keep track of the active key codes
        // we can intercept the handleInput calls for each scene
        // to prevent unnecessary calculations
        this.activeKeyCodes = [];

        // provide an array of all directions and whether they are active
        // up, right, down, left
        this.directions = [false, false, false, false];

        // provide number array
        this.numbers = [false, false, false, false, false, false, false, false, false, false];
        
        // add event listeners
        this.addEventListeners();
      }

      /**
       * Adds event listeners for keydown, keyup
       *
       * @memberof KeyboardController
       */
      addEventListeners() {
        document.addEventListener('keydown', (e) => {
          this.eventListener(e, true);
        });
        document.addEventListener('keyup', (e) => {
          this.eventListener(e, false);
        });
      }

      /**
       * The event listener for keydown / keyup
       *
       * @param {*} e
       * @returns
       * @memberof KeyboardController
       */
      eventListener(e, press) {
        // bail if disabled
        if (this.disabled) {
          return;
        }

        // bail if we don't care about the ky
        if (typeof this.keyCodes[e.keyCode] === 'undefined') {
          return;
        }

        // keep track of the active keycodes
        this.updateActiveKeyCodesArray(e.keyCode, press);

        // get the human readable value from keycode
        const key = this.keyCodes[e.keyCode];

        // bail if the state isn't changing
        if (this.active[key] === press) {
          return;
        }

        // otherwise update the state
        this.active[key] = press;
        
        // handle key combos
        this.handleKeyCombos(key, press);

        // update active directions array
        this.updateDirectionsArray();

        // update active numbers array
        this.updateNumberArray();
      }

      /**
       * Adds or removes a keyCode from this.activeKeyCodes
       *
       * @param {*} keyCode
       * @param {*} press
       * @memberof KeyboardController
       */
      updateActiveKeyCodesArray(keyCode, press) {
        // get the index
        const index = this.activeKeyCodes.indexOf(keyCode);

        // if press,
        if (press) {
          // add it if it does not exist
          if (index === -1) {
            this.activeKeyCodes.push(keyCode);
          }
        } else {
          // remove it if it exists
          if (index > -1) {
            this.activeKeyCodes.splice(index, 1);
          }
        }
      }

      /**
       * Updates keys that require shift
       * Updates aliased keys
       *
       * @param {string} key human readable key
       * @param {boolean} active whether the key is being pressed
       * @memberof KeyboardController
       */
      handleKeyCombos(key, active) {    
        // check if there is a shift version we are watching
        const shiftedKeyExists = typeof this.shiftKeys[key] !== 'undefined';

        // if there is a shift version
        if (shiftedKeyExists) {
          // get the shifted key value
          const shiftedKey = this.shiftKeys[key];
          
          // if shift is active, and we're pressing the key
          if (this.active.shift && active) {
            this.active[shiftedKey] = true;
          } else {
            // otherwise set it to inactive
            this.active[shiftedKey] = false;
          }
        }

        // wasd handling
        const aliasKeyExists = typeof this.aliasKeys[key] !== 'undefined';

        // if there is an alias version
        if (aliasKeyExists) {
          // get the alias key value
          const aliasKey = this.aliasKeys[key];

          // TODO: Add handling for the actual key that is being aliased is being pressed
          // TODO: For example, if we're pressing the A key and we're pressing the UP key,
          // TODO: If we release one of those keys, it will say we're not moving up!
          this.active[aliasKey] = active;
        }
      }

      /**
       * Updates the directions array
       *
       * @memberof KeyboardController
       */
      updateDirectionsArray() {
        this.directions = [
          (this.active.up) ? true : false,
          (this.active.right) ? true : false,
          (this.active.down) ? true : false,
          (this.active.left) ? true : false,
        ];
      }

      /**
       * Updates the numbers array
       *
       * @memberof KeyboardController
       */
      updateNumberArray() {
        this.numbers = [
          (this.active.zero) ? true : false,
          (this.active.one) ? true : false,
          (this.active.two) ? true : false,
          (this.active.three) ? true : false,
          (this.active.four) ? true : false,
          (this.active.five) ? true : false,
          (this.active.six) ? true : false,
          (this.active.seven) ? true : false,
          (this.active.eight) ? true : false,
          (this.active.nine) ? true : false,
        ];
      }

      /**
       * Clear all active keys
       *
       * @memberof KeyboardController
       */
      clear() {
        this.activeKeyCodes = [];
        
        this.active = {
          enter: false,
          shift: false,
          escape: false,
          up: false,
          right: false,
          down: false,
          left: false,
          w: false,
          a: false,
          s: false,
          d: false,
          equals: false,
          minus: false,
          plus: false,
          zero: false,
          one: false,
          two: false,
          three: false,
          four: false,
          five: false,
          six: false,
          seven: false,
          eight: false,
          nine: false,
        };

        // update active directions array
        this.updateDirectionsArray();

        // update active numbers array
        this.updateNumberArray();
      }

      /**
       * Disable use of the keyboard
       *
       * @param {boolean} [disabled=true]
       * @memberof KeyboardController
       */
      setDisabled(disabled = true) {
        this.disabled = disabled;
      }
    }

    class Debug {
      /**
       * Creates an instance of Debug.
       * @param {*} Canvas A canvas context to render information on
       * @memberof Debug
       */
      constructor(game) {
        this.game = game;
        this.Canvas = game.Canvas;

        this.canHandleInput = true;
        this.inputThrottleTimer = null;

        this.canToggleLayers = true;
      }

      drawDebugText() {
        // todo
      }

      handleInput() {
        // throttle the input a wee bit
        if (!this.canHandleInput) {
          return;
        }

        // get shorter references to game objects
        const Keyboard = this.game.Keyboard;
        const Canvas = this.game.Canvas;

        // can toggle layers
        if (this.canToggleLayers) {
          for (let i = 0; i < Keyboard.numbers.length; i++) {
            if (
              Keyboard.numbers[i]
              && typeof Canvas.layers[i] !== 'undefined'
            ) {
              Canvas.layers[i].toggleVisible();
              this.doInputCooldown();
            }
          }
        }
      }

      /**
       * Sets timeout to re-enable input handling
       *
       * @memberof Debug
       */
      doInputCooldown() {
        this.canHandleInput = false;

        window.clearTimeout(this.inputThrottleTimer);
        this.inputThrottleTimer = window.setTimeout(() => {
          this.canHandleInput = true;
        }, 150);
      }
    }

    function game() {
      // debug stuff
      this.debug = true;
      this.timestamp = 0;
      this.fps = 0;

      // debug handler
      this.Debug = new Debug(this);

      // input handler
      this.Keyboard = new KeyboardController();

      // create the canvas
      this.Canvas = new Canvas();

      // the object factory
      this.Objects = new Objects(this);

      // define the scenes
      this.scenes = {
        mainMenu: Scenes.SceneMainMenu,
        game: Scenes.SceneGame,
        pause: Scenes.ScenePause,
      };

      /** 
       * A method for setting the current scene
       */
      this.setScene = (scene) => {
        // transition out of the current scene
        if (typeof this.scene !== 'undefined') {
          this.scene.transitionOut();
        }

        // if scene is an existing scene object, use it
        // otherwise create a new scene of the specified type
        this.scene = typeof scene === 'object'
          ? scene
          : new this.scenes[scene](this);
        
        // transition into new scene
        this.scene.transitionIn();
      };

      /**
       * Calls request animation frame and the update function
       */
      this.loop = (timestamp) => {
        window.requestAnimationFrame( this.loop );
        this.update(timestamp);
      };

      /**
       * Gets called once per frame
       * This is where the logic goes
       */
      this.update = (timestamp) => {
        // clear the previous frame
        this.scene.clear();

        if (this.debug) {
          this.Canvas.debugLayer.clear();
        }

        // draw the current frame
        this.scene.draw();

        // handle keyboard input
        if (this.Keyboard.activeKeyCodes.length > 0) {
          this.scene.handleInput(this.Keyboard);

          if (this.debug) {
            this.Debug.handleInput();
          }
        }

        // maybe show debug info
        if (this.debug) {
          // fps
          const delta = (timestamp - this.timestamp) / 1000;
          this.timestamp = timestamp;
          this.Canvas.pushDebugText('fps', `FPS: ${1 / delta}`);

          // active keys
          this.Canvas.pushDebugText('activeKeys', `Keyboard.activeKeyCodes: [${this.Keyboard.activeKeyCodes.toString()}]`);

          // TODO: This is an expensive operation, 
          // TODO: Should be generated by a keystroke, not calculated every frame
          if (this.Keyboard.active.shift) {
            this.Canvas.pushDebugText('maparray', `MapArray bytes: ${objectSizeof(this.scene.map.mapArray)}`);
          }

          // draw debug text
          this.Canvas.drawDebugText();
        }
      };

      
      this.init = () => {
        // set the current scene to the main menu
        this.setScene('mainMenu');

        // start the game loop
        this.loop();
      };

      // kick the tires and light the fires!!!
      this.init();
    }

    return game;

})));
