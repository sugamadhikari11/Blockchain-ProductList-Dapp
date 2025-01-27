'use client';
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ContractAddress from "@/contracts/contract-address.json";
import productABI from "@/contracts/ProductList.json";
import ConfirmationPopup from './ConfirmationPopup.js'; // Import the confirmation popup component

interface Product {
  id: number;
  name: string;
  price: string; // Store price in ETH
  owner: string; // Track the address of the user who added the product
}

interface StateType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
}

const productContractAddress = ContractAddress.ProductList;
const contractABI = productABI.abi;
const HARDHAT_NETWORK_ID = "31337"; // Use your network ID here

export default function ProductApp() {
  const [state, setState] = useState<StateType>({
    provider: null,
    signer: null,
    contract: null,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [currentUser  , setCurrentUser  ] = useState<string | null>(null); // State to hold the current user's address
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null); // State to hold the index of the product to delete
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false); // State to control the delete confirmation popup

  // Initialize the provider, signer, and contract
  useEffect(() => {
    const connectWallet = async () => {
      const { ethereum } = window;

      if (ethereum) {
        try {
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });

          if (ethereum.networkVersion === HARDHAT_NETWORK_ID) {
            const accounts = await ethereum.request({
              method: "eth_requestAccounts",
            });

            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
              productContractAddress,
              contractABI,
              signer
            );

            const userAddress = accounts[0];
            setCurrentUser (userAddress); // Set the current user's address

            // Log the current user address
            console.log("Current User Address:", userAddress);

            setState({ provider, signer, contract });
            loadProducts(contract);
          } else {
            alert("Please switch to the correct network.");
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        alert("Please install Metamask");
      }
    };

    connectWallet();
  }, []);

  // Load products from the smart contract
  const loadProducts = async (contract: ethers.Contract) => {
    setLoading(true);
    try {
      const count = await contract.productCount();
      const productList = [];
      for (let i = 0; i < count; i++) {
        const product = await contract.getProduct(i);
        productList.push({
          id: product[0].toString(), // Use the ID from the contract
          name: product[1],
          price: ethers.formatEther(product[2]), // Convert price from Wei to ETH
          owner: product[3], // The address of the user who added the product
        });
      }
      setProducts(productList);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Error loading products.");
    }
    setLoading(false);
  };

  // Add a new product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please enter valid product details.");
      return;
    }

    if (isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
      alert("Please enter a valid price greater than 0.");
      return;
    }

    if (!state.contract) {
      console.log("Contract not initialized.");
      return;
    }

    setLoading(true); // Set loading state

    try {
      const priceInWei = ethers.parseEther(newProduct.price); // Convert price from ETH to Wei

      // Log the contract call
      console.log("Adding product:", newProduct.name, priceInWei.toString());

      const tx = await state.contract.addProduct(newProduct.name, priceInWei);
      console.log("Transaction sent:", tx.hash);

      await tx.wait(); // Wait for the transaction to be mined
      console.log("Transaction confirmed:", tx.hash);

      alert("Product added successfully!");
      setNewProduct({ name: "", price: "" });
      loadProducts(state.contract); // Reload the product list
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product.");
    }

    setLoading(false); // Reset loading state
  };

  // Confirm delete action
  const confirmDeleteProduct = async () => {
    if (deleteIndex === null || !state.contract) return;

    try {
      const tx = await state.contract.deleteProduct(deleteIndex); // Use id - 1 for zero-based index
      await tx.wait();
      alert("Product deleted successfully!");
      loadProducts(state.contract); // Reload the product list
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product.");
    } finally {
      setDeletePopupOpen(false); // Close the confirmation popup
      setDeleteIndex(null); // Reset delete index
    }
  };

  // Open delete confirmation popup
  const openDeletePopup = (index: number) => {
    setDeleteIndex(index);
    setDeletePopupOpen(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Product App</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Price (ETH)"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={addProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Product List</h2>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product, index) => (
              <div key={product.id} className="border rounded p-4">
                <p className="font-semibold">ID: { product.id}</p>
                <p>Name: {product.name}</p>
                <p>Price: {product.price} ETH</p>
                <p>Added by: {product.owner}</p>
                {currentUser  && product.owner && currentUser .toLowerCase() === product.owner.toLowerCase() && (
                  <button
                    onClick={() => openDeletePopup(index)}
                    className="bg-red-500 text-white px-4 py-2 mt-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationPopup
        open={isDeletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        onConfirm={confirmDeleteProduct}
      />
    </div>
  );
}