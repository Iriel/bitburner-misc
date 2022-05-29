/** @module table */

function addPad(out, x) {
	if (x > 0) {
		out.push(' '.repeat(x))
	}
}

export class Table {
    /** Creates a new table. */
	constructor() {
		this._rows = []
		this._cols = []
		this._spacers = []
		this._row = null
	}

	endIfStarted() {
		this._row = null
		return this
	}

	end() {
		if (!this._row) {
			this.row()
		} else {
			this._row = null
		}
		return this
	}

	row() {
		if (this._row) {
			this.end()
		}
		const row = []
		this._rows.push(row)
		this._row = row
		return this
	}

	add(value, align = '') {
		const row = this._row
		if (row === undefined) {
			throw Error('Attempt to add without row')
		}
		value = `${value}`
		const vl = value.length
		const idx = row.length
		const cols = this._cols
		cols[idx] = Math.max(cols[idx] || 0, vl)
		if (align == '') {
			row[idx] = value
		} else {
			row[idx] = [value, align]
		}
		return this
	}

	skip(n = 1) {
		const row = this._row
		if (row === undefined) {
			throw Error('Attempt to add without row')
		}
		const cols = this._cols
		let idx = row.length
		for (; n > 0; --n, ++idx) {
			if (cols[idx] === undefined) {
				cols[idx] = 0
			}
			row[idx] = ''
		}
		return this
	}

	setSpacer(col, spacer) {
		while (col > this._cols.length) {
			this._cols.push(0)
		}
		this._spacers[col] = spacer
		return this
	}

	getSpacer(col) {
		const cl = this._cols.length
		if (col < 0 || col > cl) {
			return undefined
		}
		const spacer = this._spacers[col]
		if (spacer === undefined) {
			return (col == 0 || col == cl || this.cols[col] == 0) ? '' : ' '
		} else {
			return spacer
		}
	}

	get length() {
		return this._rows.length
	}

	get columns() {
		return this._cols.length
	}

	formatRow(rowIndex) {
		const row = this._rows[rowIndex]
		if (row === undefined) {
			throw Error(`Invalid row ${rowIndex}`)
		}

		const cols = this._cols
		const spacers = this._spacers
		const cl = cols.length

		let out = []

		for (let i = 0; i < cl; ++i) {
			// SPACER
			let spc = spacers[i]
			if (spc === undefined) {
				spc = (i == 0) ? '' : ' '
			}
			if (spc !== '') {
				out.push(spc)
			}

			const w = cols[i]
			if (w == 0) {
				continue
			}

			let value = row[i]
			let align = '<'
			if (Array.isArray(value)) {
				align = value[1]
				value = value[0]
			}
			if (value === undefined) {
				value = ''
			}
			let vl = value.length
			let toPad = w - vl

			switch (align) {
				case '>':
					addPad(out, toPad)
					out.push(value)
					break

				case '=':
					const lPad = Math.floor(toPad / 2)
					addPad(out, lPad)
					out.push(value)
					addPad(out, toPad - lPad)
					break

				case '<':
				default:
					out.push(value)
					addPad(out, toPad)
					break
			}
		}
		const lastSpc = spacers[cl]
		if (lastSpc !== undefined && lastSpc !== '') {
			out.push(lastSpc)
		}
		return out
	}

	async writeAsync(asyncRowWriter) {
		for (const rowNum in this._rows) {
			await asyncRowWriter(this.formatRow(rowNum))
		}
	}

	write(rowWriter) {
		for (const rowNum in this._rows) {
			rowWriter(this.formatRow(rowNum))
		}
	}
}
