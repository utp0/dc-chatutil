# dc-chatutil

**Everything in this repository is provided as-is. No responsibility is taken for anything coming from using and/or distributing material within, no warranty is provided!** To be used for educational purposes only.

## SQLite tables

Will be finalized later. Until then, the `CREATE TABLE` statements can be found in the code.<br>
For now, no foreign keys are used to allow recording partial data if anything fails or isn't as expected.

## Stuff that's working or not

### Event-based

- [ ] Customize data to be saved
- [x] Handle messages
- [x] Handle servers
- [x] Handle channels
- [x] Handle threads + list sync
- [ ] Handle polls
- [ ] Handle reactions
  - [x] Add
    - [ ] batch
  - [ ] Remove
- [ ] UI
  - [ ] Live message log
    - [ ] filters
  - [ ] Known server list
  - [ ] Known channel list
  - [ ] Known users list

### Old data

- [ ] Saving of past messages
- [ ] ...

### Other things

- [x] Necessary tables
- [ ] Cleanup unnecessary reference passes, get them from main object
- [ ] Code quality improvements
