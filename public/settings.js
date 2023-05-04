function removeAddress(address) {
  fetch("/api/settings/address", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ address })
  }).then(_ => {
    const div = document.getElementById(address);
    div.parentElement.removeChild(div);
  });
}

function addAddress(addr) {
  const div = document.getElementById("addresses");

  const a = document.createElement("div");
  a.id = addr;
  const p = document.createElement("p");
  p.innerHTML = addr;

  const b = document.createElement("button");
  b.id = addr;
  b.innerHTML = "Delete";

  a.append(p, b);
  div.append(a);
  b.addEventListener("click", (e) => removeAddress(e.target.id));
}

function submitAddress(address) {
  fetch("/api/settings/address", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ address })
  }).then(res => res.json()).then((addr) => {
    addAddress(address);
  })

}

function init() {
  fetch("/api/settings/address").then(res => res.json()).then(addresses => {
    for (let a of addresses) {
      addAddress(a.address);
    }
  })
}

document.getElementById("submit").addEventListener("click", (e) => {
  const input = document.getElementById("new-address");

  const address = input.value;

  if (address == "") {
    alert("address cannot be empty");
    return;
  }

  input.value = "";

  submitAddress(address);
});

init();