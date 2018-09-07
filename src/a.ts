import web3 = require("web3")

export function a() {
  const w = new web3()
  if (w.eth.defaultBlock === "pending") {
    return true
  }

  return false
}
