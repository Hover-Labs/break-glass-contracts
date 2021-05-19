# Break Glass Contracts

The `Break Glass` Contracts provide a layer of abstraction between the Murmation DAO and Kolibri core contracts. They have a safety switch which can revert control. 

There are two flavors of `Break Glass`:
- **Regular** - Used for all contracts that are not the `Kolibri Minter`
- **Minter** - Used for the `Kolibri Minter` contract

The `Kolibri Minter` has a slightly different API than the rest of the contracts.

## API

Each `Break Glass` has the following API:

### `runLambda`

Accepts a `lambda(unit, list operation)` which the `Break Glass` will execute. This entrypoint conceptually allows governance to proceed. It may only be called by the DAO.

### `breakGlass`

Revert control of the `Kolibri` contracted wrapped by this break glass to the multisig. This entrypoint conceptually reverts the effects of distributed governance. It may only be called by the multisig. 

## Storage

The following fields are in storage
- `targetContract` (`address`) - The Kolibri contract controlled by this `Break Glass`
- `multisigAddress` (`address`) - The address which may revert control of the Kolibri contract to itself.
- `daoAddress` (`address`) - The address which may execute lambdas inside of the `Break Glass`

## Testing

Test contracts:
```
cd smart_contracts && ./compile.sh
```

Real world testing:
```
cd deploy && ts-node src/deploy-edonet
```
