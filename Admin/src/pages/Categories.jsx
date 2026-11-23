import { useEffect, useState } from 'react';
import api, { getError } from '../api';

// categories (Men, Women...) and their subcategories (T-Shirts, Shirts...)
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [subs, setSubs] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubs, setEditSubs] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const load = () => api.get('/categories').then((r) => setCategories(r.data));
  useEffect(() => { load(); }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name, subcategories: subs });
      setName(''); setSubs('');
      setMsg({ text: 'Category added', type: 'success' });
      load();
    } catch (err) { setMsg({ text: getError(err), type: 'error' }); }
  };

  const saveEdit = async (id) => {
    try {
      await api.put('/categories/' + id, { name: editName, subcategories: editSubs });
      setEditId(null);
      setMsg({ text: 'Category updated', type: 'success' });
      load();
    } catch (err) { setMsg({ text: getError(err), type: 'error' }); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete('/categories/' + id);
      setMsg({ text: 'Category deleted', type: 'success' });
      load();
    } catch (err) { setMsg({ text: getError(err), type: 'error' }); }
  };

  return (
    <div>
      <h1>Categories & Subcategories</h1>
      {msg.text && <p className={'msg ' + msg.type}>{msg.text}</p>}

      <form className="form-card cat-form" onSubmit={addCategory}>
        <div className="two-col">
          <div><label>Category name</label><input placeholder="e.g. Men" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><label>Subcategories (comma separated)</label><input placeholder="T-Shirts, Shirts, Jeans" value={subs} onChange={(e) => setSubs(e.target.value)} /></div>
        </div>
        <div className="btn-row"><button className="btn">Add Category</button></div>
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Subcategories</th><th>Actions</th></tr></thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c._id}>
                <td>{i + 1}</td>
                {editId === c._id ? (
                  <>
                    <td><input value={editName} onChange={(e) => setEditName(e.target.value)} /></td>
                    <td><input value={editSubs} onChange={(e) => setEditSubs(e.target.value)} /></td>
                    <td>
                      <button className="btn small-btn" onClick={() => saveEdit(c._id)}>Save</button>{' '}
                      <button className="btn small-btn btn-outline" onClick={() => setEditId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td><b>{c.name}</b></td>
                    <td>{c.subcategories.length ? c.subcategories.map((s) => <span className="tag grey" key={s}>{s}</span>) : '-'}</td>
                    <td>
                      <button className="btn small-btn" onClick={() => { setEditId(c._id); setEditName(c.name); setEditSubs(c.subcategories.join(', ')); }}>Edit</button>{' '}
                      <button className="btn small-btn danger" onClick={() => remove(c._id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small" style={{ marginTop: 10 }}>Note: if you rename a subcategory, edit the products that used the old name.</p>
    </div>
  );
}
