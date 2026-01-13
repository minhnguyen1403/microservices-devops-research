# Genereate Key for Replicas
```
bash ./scripts/generateKey.sh
```

# MONGODB

## INIT REPLICATE NODE
```
rs.init<tab>()
```


## ADD REPLICATE MEMBER
```
rs.add({ host: "host:port" })
rs.add("host:port")
```


## ADD REPLICATE MEMBER ARBITER
## ADD REPLICATE MEMBER HIDDEN
## ADD REPLICATE MEMBER DELAY
## ADD REPLICATE MEMBER INIT SYNC
```
rs.add(
 {
   _id: <int>,
   host: <string>,
   arbiterOnly: <boolean>,
   buildIndexes: <boolean>,
   hidden: <boolean>,
   priority: <number>,
   tags: <document>,
   secondaryDelaySecs: <int>,
   votes: <number>
)
```

rs.initiate( {
    _id : "rs0",
    members: [
       { _id: 0, host: "kf_stack_mongodb-01:27017" },
       { _id: 1, host: "kf_stack_mongodb-02:27017" },
       { _id: 2, host: "kf_stack_mongodb-03:27017" }
    ]
 })