import React from 'react';
import axios from 'axios';
import './App.css';

class App extends React.Component {
    state = {
        new_url: '',
        product_list: [],
        selected_category: '',
        fetching: false,
        counter: 0,
        automatic_timer: 3
    };

    componentDidMount() {
        this.get_all_products()
    }

    startTimer = (start=true) => {
        if (start && (this.state.new_url !== '')){
            clearInterval(this.timer)
            this.setState({counter: 0})
            this.timer = setInterval(() => {
                if (this.state.counter<this.state.automatic_timer){
                    this.setState({counter: this.state.counter + 1})
                }
                else {
                    clearInterval(this.timer)
                    this.setState({counter: 0})
                    if (this.state.new_url !== ''){
                        this.handleSubmit()
                    }
                }}, 1000);
        }
        else {
            clearInterval(this.timer)
            this.setState({counter: 0})
        }
    }

    get_all_products = () => {
        this.setState({fetching: true, counter: 0})
        axios.get('http://127.0.0.1:8000/api/get_all_products/').then((response) => {
            let data = response.data["data"]
            data.map((product, index) => {
                data[index]['selected_image'] = 0
                data[index]['full_description'] = false
                if (data[index]["sizes"].length === 0){
                    data[index]["sizes"] = ["No Size Data"]
                }

                return data
            })
            this.setState({product_list: data, fetching: false})
            window.alert(response.data["message"])
        }).catch((error) => {
            console.error(error)
            window.alert(error)
            this.setState({fetching: false})
        })
    }

    handleSubmit = () => {
        clearInterval(this.timer)
        this.setState({fetching: true, counter: 0})
        axios.post('http://127.0.0.1:8000/api/fetch_product/', {product_url: this.state.new_url}).then((response) => {
            let data = response.data
            data['selected_image'] = 0
            data['full_description'] = false
            if (data["sizes"].length === 0){
                data["sizes"] = ["No Size Data"]
            }
            let updated = false
            let product_list = [...this.state.product_list]

            product_list.map((product, index) => {
                if (product_list[index]["id"] === data["id"]){
                    product_list[index] = data
                    this.setState({product_list: product_list, new_url: '', fetching: false})
                    updated = true
                }
            })
            if (!updated){
                let product_list = [...this.state.product_list, data]
                this.setState({product_list: product_list, new_url: '', fetching: false})
            }
        }).catch((error) => {
            console.error(error)
            window.alert(error)
            this.setState({fetching: false})
        })
    }

    read_more = (index) => {
        let data = this.state.product_list
        data[index]["full_description"] = !data[index]["full_description"];
        this.setState({product_list: data})
    }

    change_image = (index, value) => {
        let data = this.state.product_list
        data[index]["selected_image"] = data[index]["selected_image"] + value;
        this.setState({product_list: data})
    }

    render() {
        return (
            <div className='app'>
                <div className='card'>
                    <div className='card-header'>
                        <div className='row'>
                            <div className='col-lg-10 col-md-9 col-sm-8 mx-auto'>
                                <input type='text' className='form-control' value={this.state.new_url} onChange={(e) => this.setState({new_url: e.target.value}, this.startTimer)}></input>
                            </div>
                            <div className='col-lg-2 col-md-3 col-sm-4 mx-auto'>
                                <button className='btn btn-success' disabled={this.state.fetching || this.state.new_url===''} onClick={this.handleSubmit}>Fetch Immediate {(this.state.counter===0)?"":`(${this.state.automatic_timer + 1 - this.state.counter})`}</button>
                            </div>
                        </div>
                    </div>
                    <div className='card-body'>
                        {this.state.selected_category===''?<></>:<><span className='font-weight-bold'>Selected Category:</span> <button className='btn btn-danger' onClick={() => {this.setState({selected_category: ''})}}>{this.state.selected_category} X</button></>}
                        <div className='row'>
                            {this.state.product_list.map((product, index) => {return <>
                                {((this.state.selected_category==='') || (this.state.selected_category===product.category))?<>
                                    <div className='col-lg-12 col-md-12 col-sm-12 mx-auto my-3' id={index}>
                                        <div className='row'>
                                            <div className='col-6'>
                                                <img className="card-img-top" src={product.images[product.selected_image]} alt="Product"></img>
                                            </div>
                                            <div className='col-6'>
                                                <div className='card m-auto'>
                                                    <div className='card-header text-center'>
                                                        <div className='row'>
                                                            <button className='btn btn-outline-secondary text-left mx-auto' disabled={product.selected_image===0} onClick={() => {this.change_image(index, -1)}}>Prev</button>
                                                            <button className='btn btn-outline-secondary text-center mx-auto' disabled={true}>{product.selected_image + 1} / {product.images.length}</button>
                                                            
                                                            <button className='btn btn-outline-secondary text-right mx-auto' disabled={product.selected_image===(product.images.length-1)} onClick={() => {this.change_image(index, 1)}}>Next</button>
                                                        </div>
                                                    </div>
                                                    <div className='card-header text-center font-weight-bold'>{product.title}</div>
                                                    <div className='card-body'>
                                                        <div><span className='font-weight-bold'>Price: ₹ {product.price}</span></div>
                                                        <br/>
                                                        <div><span className='font-weight-bold'>Ratings: {product.rating} ⭐</span></div>
                                                        <br/>
                                                        <div><span className='font-weight-bold'>Size / Vareity: {product.sizes.map((size, size_index) => {return <>{size}{(size_index===product.sizes.length-1)?"":", "}</>})}</span></div>
                                                        <br/>
                                                        <div><span className='font-weight-bold'>Category: </span><button className='btn btn-success text-right' onClick={() => {this.setState({selected_category: product.category})}}>{product.category}</button></div>
                                                        <br/>
                                                        <div><span className="mr-2"><span className='font-weight-bold'>Description:</span> {product.full_description?product.description:product.description.slice(0, 75)+"...."}</span>
                                                            <button className={`btn btn-${product.full_description?"primary":"warning"} text-right`} onClick={() => {this.read_more(index)}}>{product.full_description?"Hide Description":"Read More"}</button>
                                                        </div>
                                                        <br/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>:<></>}
                            </>})}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App