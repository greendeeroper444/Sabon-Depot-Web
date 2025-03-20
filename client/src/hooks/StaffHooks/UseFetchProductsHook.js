import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function UseFetchProductsHook(selectedCategory) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async(category = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/staffProduct/getProductsStaff', {
                params: {category}
            });

            setProducts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(selectedCategory);
    }, [selectedCategory]);

  return {products, loading, error};
}
