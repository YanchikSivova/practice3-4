import { useEffect, useMemo, useState } from "react";
import { createProduct, deleteProduct, getProducts, updateProduct, searchProduct} from "../api/productsApi";
import "../styles/Home.scss"

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Состояния для поиска
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Минимальная форма добавления товара
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("")

  const canSubmit = useMemo(() => title.trim() !== "" && price !== "" && description.trim() !== "", [title, price, description]);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await getProducts(); // TODO: заработает после реализации productsApi.js
      setItems(data);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  //Функция поиска
async function handleSearch(){
  if(!searchTerm.trim()){
    await load();
    return;
  }
  setError("");
  setSearchLoading(true);
  try{
    const data = await searchProduct(searchTerm.trim());
    setItems(data);
  }catch(e){
    setError(String(e?.message || e));
  }finally{
    setSearchLoading(false);
  }
}

//Сброс поиска

async function handleReset(){
  setSearchTerm("");
  await load();
}
  useEffect(() => {
    load();
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    try {
      await createProduct({
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
      });
      setTitle("");
      setPrice("");
      setDescription("");
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function onDelete(id) {
    setError("");
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function onPricePlus(id, currentPrice) {
    setError("");
    try {
      await updateProduct(id, { price: Number(currentPrice) + 10 });
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function onEdit(id, field, value){
    setError("");
    try{
      if(field == 'price'){
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0){
          throw new Error('Цена должна быть числом больше или равным 0');
        }
        value = value.trim();
      }else {
        if (typeof(value) !== 'string' || !value.trim()){
          throw new Error('Поле не может быть пустым');
        }
        value = value.trim();
      }
      await updateProduct(id, { [field]: value});
      await load();
    }catch (e){
      setError(String(e?.message || e));
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center" }}>React + Express API</h1>

      <section style={{ marginTop: 24, /*padding: 16, /*border: "1px solid #ddd",*/ borderRadius: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: "center" }}>Добавить товар</h2>
        <form className="product-form" onSubmit={onAdd} /*style={{ display: "flex", gap: 12, flexWrap: "wrap" }}*/>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            style={{ padding: 10/*, minWidth: 220 */ }}
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Цена"
            type="number"
            style={{ padding: 10/*, width: 140 */ }}
          />
          <input value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            style={{ padding: 10/*, width:220 */ }} />
          <button disabled={!canSubmit} /*style={{ padding: "10px 14px" }}*/>
            Добавить
          </button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <div className="productsHeader">
          <h2>Список товаров</h2>
          {/* Поиск */}
          <button type="button" onClick={load} style={{ padding: "10px 14px" }}>
            Обновить список
          </button>
          <div className="searchbar">
            <form className="searchbar-form">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Введите название для поиска..."/>
            </form>
            <button type="button" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? "Поиск..." : "Найти"} 
            </button>
            <button type="button" onClick={handleReset}>
              Сброс
            </button>
          </div>
        </div>
      

        {loading && <p>Загрузка...</p>}
        {searchLoading && <p>Поиск...</p>}
        {error && (
          <p>Ошибка: {error}</p>
        )}
        
        {!loading && !searchLoading && searchTerm && (
          <p>Найдено товаров по запросу "{searchTerm}" : {items.length}</p>
        )}

        <ul className="productsList">
          {items.map((p) => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <span className="Title"
              onClick={() => {
                const newTitle = prompt('Введите новое название: ', p.title);
                if (newTitle && newTitle.trim()){
                  onEdit(p.id, 'title', newTitle.trim());
                }
              }}
              style={{cursor: 'pointer'}}
              >
                {p.title}
                </span>
              <span className="Price"
              onClick={() => {
                const newPrice = prompt('Введите новую цену: ', p.price);
                if (newPrice && newPrice.trim()){
                  onEdit(p.id, 'price', newPrice.trim());
                }
              }}
              style={{cursor:'pointer'}}
              >
                {p.price} ₽
                </span>
              <span className="Description"
              onClick={()=>{
                const newDescription = prompt('Введите новое описание: ', p.description);
                if (newDescription && newDescription.trim()){
                  onEdit(p.id, 'description', newDescription.trim());
                }
              }}
              style={{cursor:'pointer'}}
              >
                {p.description}
                </span>
              <button className="plusButton" onClick={() => onPricePlus(p.id, p.price)} style={{ marginLeft: 8 }}>
                +10 ₽
              </button>
              <button className="deleteButton" onClick={() => onDelete(p.id)} style={{ marginLeft: 8 }}>
                Удалить
              </button>
            </li>
          ))}

          {!loading && !searchLoading && items.length === 0 && (
            <li>
              {searchTerm ? "Ничего не найдено" : "Товары отсутствуют"}
            </li>
          )}
        </ul>

      </section>
    </div>
  );
}

export default Home;