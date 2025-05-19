import React, { useState, useEffect } from "react";

const STATUS = {
  RECEIVED: "Received",
  READY_TO_SHIP: "Ready to Ship",
  DELIVERED: "Delivered",
};

function App() {
  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("products")) || [];
  });
  const [productForm, setProductForm] = useState({
    id: null,
    name: "",
    price: "",
    image: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [orders, setOrders] = useState(() => {
    return JSON.parse(localStorage.getItem("orders")) || [];
  });

  const counts = {
    delivered: orders.filter((o) => o.status === STATUS.DELIVERED).length,
  };

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const addOrUpdateProduct = () => {
    const { id, name, price, image, description } = productForm;
    if (!name || !price || !image) {
      alert("Please fill in all required fields (name, price, image).");
      return;
    }

    if (id) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...productForm, price: Number(price) } : p))
      );
    } else {
      const newProduct = {
        id: Date.now(),
        name,
        price: Number(price),
        image,
        description,
      };
      setProducts((prev) => [...prev, newProduct]);
    }
    setProductForm({ id: null, name: "", price: "", image: "", description: "" });
  };

  const editProduct = (id) => {
    const product = products.find((p) => p.id === id);
    if (product) setProductForm(product);
  };

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addDummyOrder = () => {
    if (products.length === 0) {
      alert("Add some products first!");
      return;
    }
    const newOrder = {
      id: Date.now(),
      productId: products[0].id,
      productName: products[0].name,
      status: STATUS.RECEIVED,
      date: new Date().toLocaleString(),
    };
    setOrders((prev) => [...prev, newOrder]);
  };

  const updateOrderStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const displayedOrders =
    activeTab === "orders"
      ? orders.filter((o) => o.status !== STATUS.DELIVERED)
      : orders.filter((o) => o.status === STATUS.DELIVERED);

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>FashionFeast Admin</h2>
        <nav className="nav">
          <button
            className={activeTab === "products" ? "active-tab-btn" : "tab-btn"}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={activeTab === "orders" ? "active-tab-btn" : "tab-btn"}
            onClick={() => setActiveTab("orders")}
          >
            Orders <span className="badge">{orders.length}</span>
          </button>
          <button
            className={activeTab === "history" ? "active-tab-btn" : "tab-btn"}
            onClick={() => setActiveTab("history")}
          >
            Order History <span className="badge">{counts.delivered}</span>
          </button>
          <button
            className="tab-btn"
            onClick={addDummyOrder}
            title="Add dummy order for testing"
          >
            + Add Dummy Order
          </button>
        </nav>
      </aside>

      <main className="main">
        {activeTab === "products" && (
          <>
            <h2>Manage Products</h2>
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={productForm.name}
                onChange={handleInputChange}
                className="input"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={productForm.price}
                onChange={handleInputChange}
                className="input"
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={productForm.image}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <textarea
              name="description"
              placeholder="Description"
              value={productForm.description}
              onChange={handleInputChange}
              className="textarea"
            />
            <button onClick={addOrUpdateProduct} className="primary-btn">
              {productForm.id ? "Update Product" : "Add Product"}
            </button>

            <h3 style={{ marginTop: 30 }}>Product List</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ width: "100%", marginBottom: 15 }}
            />
            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="product-card">
                    <img src={p.image} alt={p.name} />
                    <h4>{p.name}</h4>
                    <p>${p.price.toFixed(2)}</p>
                    <p>{p.description}</p>
                    <button
                      className="small-btn"
                      onClick={() => editProduct(p.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="small-btn delete"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {(activeTab === "orders" || activeTab === "history") && (
          <>
            <h2>{activeTab === "orders" ? "Current Orders" : "Order History"}</h2>
            {displayedOrders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <ul className="order-list">
                {displayedOrders.map((order) => (
                  <li key={order.id} className="order-item">
                    <div>
                      <strong>{order.productName}</strong> — {order.status} <br />
                      <small>{order.date}</small>
                    </div>
                    {activeTab === "orders" && (
                      <div>
                        {order.status === STATUS.RECEIVED && (
                          <button
                            className="small-btn"
                            onClick={() =>
                              updateOrderStatus(order.id, STATUS.READY_TO_SHIP)
                            }
                          >
                            Mark Ready to Ship
                          </button>
                        )}
                        {order.status === STATUS.READY_TO_SHIP && (
                          <button
                            className="small-btn"
                            onClick={() =>
                              updateOrderStatus(order.id, STATUS.DELIVERED)
                            }
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
