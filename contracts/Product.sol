// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductList {
    struct Product {
        uint256 id;       // Unique identifier for the product
        string name;      // Name of the product
        uint256 price;    // Price of the product in Wei
        address owner;    // Address of the user who added the product
    }

    Product[10] public products; // Fixed-size array to hold up to 10 products
    uint256 public productCount; // Counter to track the number of products added

    // Function to add a product to the array
    function addProduct(string memory _name, uint256 _price) public {
        require(productCount < 10, "Product list is full"); // Ensure array limit isn't exceeded
        products[productCount] = Product(productCount +1, _name, _price, msg.sender); // Add the product with the owner's address
        productCount++; // Increment the product counter
    }

    // Function to get product details by index
    function getProduct(uint256 _index) public view returns (uint256, string memory, uint256, address) {
        require(_index < productCount, "Invalid product index"); // Ensure the index is valid
        Product memory product = products[_index];
        return (product.id, product.name, product.price, product.owner); // Return the product details
    }

    // Function to delete a product by index and rearrange products
    function deleteProduct(uint256 _index) public {
        require(_index < productCount, "Invalid product index"); // Ensure the index is valid

        // Shift all products after the deleted index to the left
        for (uint256 i = _index; i < productCount - 1; i++) {
            products[i] = products[i + 1]; // Move the next product into the current slot
            products[i].id = i; // Reassign the ID to reflect the new position
        }

        // Clear the last product (to avoid duplicate data)
        delete products[productCount - 1]; // Clear the last product
        productCount--; // Decrease the product counter
    }

    // Function to list all active products
    function listProducts() public view returns (Product[] memory) {
        Product[] memory activeProducts = new Product[](productCount);

        for (uint256 i = 0; i < productCount; i++) {
            activeProducts[i] = products[i];
        }

        return activeProducts; // Return the active products
    }

    // Function to edit a product by index
    function editProduct(uint256 _index, string memory _name, uint256 _price) public {
        require(_index < productCount, "Invalid product index"); // Ensure the index is valid
        products[_index].name = _name; // Update the name
        products[_index].price = _price; // Update the price
    }

    // Function to search for a product by name
    function searchProduct(string memory _name) public view returns (uint256, uint256, address) {
        for (uint256 i = 0; i < productCount; i++) {
            if (keccak256(abi.encodePacked(products[i].name)) == keccak256(abi.encodePacked(_name))) {
                return (products[i].id, products[i].price, products[i].owner); // Return ID, price, and owner address if found
            }
        }
        revert("Product not found");
    }
}