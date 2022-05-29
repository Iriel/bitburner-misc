# lib/table.js

## Usage

``` js
import { Table } from 'lib/table'
```

``` js
let table = new Table()

table.row()
   .add('Input', '=')
   .add('Output', '=')
   .end()

for (let i = 1; i < 10; ++i) {
	table.row()
		.add(i, '>')
		.add(ns.nFormat(Math.log(i), '0.000'), '>')
		.end()
}

table.setSpacer(1, ' | ')

table.write(r => ns.tprint(...r))
```

## Properties

* ``length`` - the number of rows
* ``columns`` - the number of columns

## Methods

The following methods are provided for populating the table.
All of them return the table to permit chaining.

* `row() : Table` - Start a new row (ending any current row)
* `add(value, [align]) : Table` - Adds a cell value with optional alignment
* `skip([num]) : Table` - Adds num (default 1) blank columns
* `end() : Table` - End the current row (starting one if necessary)
* `endIfStarted() : Table` - End the current row if there is one
* `setSpacer(index, spacer) : Table` - Sets the spacer to use before a column

These methods deal with table output:

* `formatRow(index) : string[]` - Gets the formatted contents of a row
* `write(callback)` - Writes the table synchronously
* `async writeAsync(callback)` - Writes the table asynchronously

## Alignment

The following alignment specifies are supported as the second
parameter to `add(value, [alignment])`

* `ALIGN_LEFT = '<'` - Left align (default)
* `ALIGN_RIGHT = '>'` - Right align
* `ALIGN_CENTER = '='` - Center

## Spacers

The `setSpacer(index, spacer)` method determines the spacer
to print before each column (and after the last). Index `0`
appears before the first column.

## Output

Output is performed using either the `write(callback)` or
`async writeAsync(callback)` methods. The async variation
will `await` the callback each time.

In both cases the callback is invoked with an array containing the
formatted row and the row number.

