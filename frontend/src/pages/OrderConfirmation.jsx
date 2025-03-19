// OrderConfirmation.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/auth/nav';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addressId, email } = location.state || {};
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    useEffect(() => {
        if (!addressId || !email) {
            navigate('/select-address');
            return;
        }
        const fetchData = async () => {
            try {
                const [addressResponse, cartResponse] = await Promise.all([
                    axios.get('http://localhost:8000/api/v2/user/addresses', { params: { email } }),
                    axios.get('http://localhost:8000/api/v2/product/cartproducts', { params: { email } })
                ]);
                const address = addressResponse.data.addresses.find(addr => addr._id === addressId);
                if (!address) throw new Error('Selected address not found.');
                setSelectedAddress(address);
                const processedCartItems = cartResponse.data.cart.map(item => ({
                    product: item.productId._id,
                    name: item.productId.name,
                    price: item.productId.price,
                    image: item.productId.images.length ? `http://localhost:8000${item.productId.images[0]}` : '/default-avatar.png',
                    quantity: item.quantity,
                }));
                setCartItems(processedCartItems);
                setTotalPrice(processedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0));
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [addressId, email, navigate]);

    const handlePlaceOrder = async (paymentType = 'cod', paypalOrderData = null) => {
        try {
            const orderItems = cartItems.map(item => ({
                product: item.product,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            }));
            const response = await axios.post('http://localhost:8000/api/v2/orders/place-order', {
                email,
                shippingAddress: selectedAddress,
                orderItems,
                paymentMethod: paymentType,
                paypalOrderData,
            });
            console.log('Order placed successfully:', response.data);
            navigate('/order-success');
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    if (loading) return <div className='w-full h-screen flex justify-center items-center'><p className='text-lg'>Processing...</p></div>;
    if (error) return <div className='w-full h-screen flex flex-col justify-center items-center'><p className='text-red-500 text-lg mb-4'>Error: {error}</p><button onClick={() => window.location.reload()} className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'>Retry</button></div>;

    return (
        <div className='w-full min-h-screen flex flex-col'>
            <NavBar />
            <div className='flex-grow flex justify-center items-start p-4'>
                <div className='w-full max-w-4xl border border-neutral-300 rounded-md flex flex-col p-6 bg-white shadow-md'>
                    <h2 className='text-2xl font-semibold mb-6 text-center'>Order Confirmation</h2>
                    <div className='mb-6'>
                        <h3 className='text-xl font-medium mb-2'>Shipping Address</h3>
                        <p className='p-4 border rounded-md'>{selectedAddress?.address1}, {selectedAddress?.city}, {selectedAddress?.state}, {selectedAddress?.zipCode}, {selectedAddress?.country}</p>
                    </div>
                    <div className='mb-6'>
                        <h3 className='text-xl font-medium mb-2'>Cart Items</h3>
                        {cartItems.map((item) => (
                            <div key={item.product} className='flex justify-between items-center border p-4 rounded-md'>
                                <div className='flex items-center'>
                                    <img src={item.image} alt={item.name} className='w-16 h-16 object-cover rounded-md mr-4' />
                                    <div>
                                        <p className='font-medium'>{item.name}</p>
                                        <p className='text-sm text-gray-600'>Quantity: {item.quantity}</p>
                                        <p className='text-sm text-gray-600'>Price: ${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <p className='font-semibold'>${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <p className='text-xl font-semibold text-right mb-6'>Total: ${totalPrice.toFixed(2)}</p>
                    <div className='mb-6'>
                        <h3 className='text-xl font-medium mb-2'>Payment Method</h3>
                        <label className='mr-4'><input type='radio' name='paymentMethod' value='cod' checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on Delivery</label>
                        <label><input type='radio' name='paymentMethod' value='paypal' checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} /> PayPal</label>
                    </div>
                    {paymentMethod === 'paypal' && (
                        <PayPalScriptProvider options={{ 'client-id': 'Your-PayPal-Client-ID' }}>
                            <PayPalButtons createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: totalPrice.toFixed(2) } }] })} onApprove={async (data, actions) => handlePlaceOrder('paypal', await actions.order.capture())} onError={(err) => console.error('PayPal error:', err)} />
                        </PayPalScriptProvider>
                    )}
                    {paymentMethod === 'cod' && <button onClick={() => handlePlaceOrder('cod', null)} className='bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600'>Place Order</button>}
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
