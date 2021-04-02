// @ts-nocheck

class DummyVariable {}
class Id {}
class Vector {}
class TfIdf {}

const cbf = new cbf_engine({
  schema: {
    db_id: Id,
    price: Number,
    tipo: DummyVariable,
    desc: TfIdf
  },
  isAdaptative: true,
  multiEntry: true,
  experimental_data_relation: {
    '123': { data: 23123 }
  },
  transformFirst: true,
  validateFirst: true,
  logger: true,
  loggerMeta: true, // log validators e transformers
})

const myCbf = cbf.entry(123)
cbf.removeEntry(123)
cbf.moveEntryData(123, 321)
cbf.unifyEntryData(123, 321)

cbf.wheights // retorna as wheights
cbf.wheights({
  price: 0.1
})

cbf.fields // Retorna os campos e suas weights

cbf.fields === { db_id: Id, price: 0.1 }

// valida a data
cbf.validators === [ e => !!Number(e.price) ]
cbf.validators.add(e => e.db_id instanceof String)
cbf.validators.remove(e => e.db_id instanceof String)
cbf.validators.removeAll()

// transforma a data
cbf.transformers === [ e => ({...e, db_id: e.db_id}) ]
cbf.transformers.add(e => ({...e, db_id: e.db_id}))
cbf.transformers.remove(e => ({...e, db_id: e.db_id}))
cbf.transformers.removeAll()

cbf.viewPipeline() === [
  ...cbf.transformers,
  e => ValidateSchema(e, cbf.schema),
  ...cbf.validators,
]

cbf.reversePipeline()

cbf.findSimilarTo(data) // vetor ou data
cbf.findSimilarTo(data, { limit: 10, threshold: -1 || 1 })
const { result, ids, vectors, similarities } = cbf.findSimilarTo(data)

cbf.query({ price: 1231231 }) // os valores omitidos terão peso 0;
cbf.query({ price: 1.3231231 }, { isStandarized: true }) // isStandarized bloqueia a função de std

cbf.addData(...data || data)

cbf.set('123', data)
const vector = cbf.getVector('123') as Vector

cbf._mean
cbf._variance
cbf._size

cbf.removeData(...data || data)

const vectorsCSV = cbf.getModelVectorsCSV()
cbf.loadModelFromCSV(vectorsCSV)

cbf._standardScaler.scale({price: 123123}) === { price: 1.2313 } 

cbf.showLogs() === [
    {
        when: 1, // tempo depois da inicializacao da engine,
        method: 'init',
        caller: String, // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller "return myFunc.caller.name" talvez impossivel;
        input: {schema:{}},
        output: Promise // talvez impossivel
    }
]

cbf.showLogs('removeData') // só exibe esse metodo

cbf.queryOnInterest({
    interests: [ ['123', 0.98], ['153', 0.94], ['143', 0.81] ], // id e interesse em cada id
    decay: 0.1, // inputs mais velhos tem um interesse com peso menor,
    limit: 10,
    threshold: 0.8
})

// experimental

const [ startTimer, pauseTimer, setInterest ] = cbf.createUser('aaaa')

setInterest('231')

const unpauseTimer = pauseTimer()
const pauseTimer = unpauseTimer()

const endTimer = startTimer()
endTimer()

const TweakerInstance = cbf._weightTweaker({ // usado para achar o melhor peso para cada feature
  price: [ 0, 1 ] // valores possiveis
})

const [
  price0,
  price1
] = TweakerInstance.findSimilarTo(data)

price0 === {
  weights,
  results, ids, vectors, similarities
}

class MinMaxWeight {}

const TweakerInstance = cbf._weightTweaker({ // usado para achar o melhor peso para cada feature
  price: new MinMaxWeight(0.4, 0.9) // valores possiveis
})

const [
  price_04, price_05, price_06, price_07, price_08, price_09
] = TweakerInstance.findSimilarTo(data)

export default {};