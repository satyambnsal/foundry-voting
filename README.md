# Foundry Voting example


# Generating proof string using



# Development Guide
```
bun install
```

```
bun run test
```

## Noir Circuit flow
Go to `circuits` directory
```
cd circuits
```

Run test cases
```
nargo test --show-output
```


### Nargo commands

Generate Prover.toml file
```
nargo check
```
Execute circuit and generate witness(before this make changes in `Prover.toml` to fill circuit inputs)
```
nargo execute
```
**`nargo exeute` command will generate a circuit json and witness file in `target` folder**


Generate proof using **UltraPlonk**
```
bb prove -b ./target/circuits.json -w ./target/circuits.gz -o ./target/proof
```
Generate solidity verifier contract
```
bb contract
```


Command to generate proof string from proof file
```
tail -c +97 ./target/proof | od -An -v -t x1 | tr -d $' \n'
```





