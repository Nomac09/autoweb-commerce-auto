"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Car = {
  id: string; title: string; price: number; year: number; km: number;
  fuel: string; gearbox: string; images: string[]; description: string;
  budget_tag: string; status: string; features: string[]; color?: string;
  doors?: number; power_din?: number; co2?: number; equipments?: string[];
  guarantee?: string; sort_order?: number; added_at?: string;
};

const empty = {
  title:"", price:0, year:new Date().getFullYear(), km:0,
  fuel:"Essence", gearbox:"Manuelle", images:[], description:"",
  status:"available", features:[], color:"", doors:undefined,
  power_din:undefined, co2:undefined, equipments:[], guarantee:"",
};

function budgetTag(p:number){ return p<2000?"< 2000 €":p<=4000?"2000-4000 €":"≥ 4000 €"; }
function slugify(t:string,y:number){ return `${t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}-${y}-${Date.now().toString(36)}`; }

// ── Login ────────────────────────────────────────────────
function LoginScreen({ onLogin }:{ onLogin:()=>void }) {
  const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const submit=async(e:React.FormEvent)=>{ e.preventDefault(); setLoading(true);
    const r=await fetch("/api/admin/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})});
    if(r.ok) onLogin(); else { setErr("Mot de passe incorrect"); setLoading(false); }
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",padding:"20px"}}>
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"40px",width:"100%",maxWidth:"380px",borderTop:"3px solid var(--accent)"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{width:"56px",height:"56px",background:"var(--accent)",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px",fontWeight:900,color:"var(--bg)",margin:"0 auto 16px",fontFamily:"var(--font-head)"}}>A</div>
          <h1 style={{fontFamily:"var(--font-head)",fontSize:"22px",fontWeight:700,textTransform:"uppercase",color:"var(--white)"}}>AUTOWEB Admin</h1>
        </div>
        <form onSubmit={submit}>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Mot de passe" autoFocus
            style={{width:"100%",padding:"13px 16px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--radius)",color:"var(--white)",fontSize:"15px",fontFamily:"inherit",marginBottom:"12px",outline:"none",boxSizing:"border-box"}} />
          {err&&<p style={{color:"#ff4444",fontSize:"13px",marginBottom:"12px"}}>{err}</p>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"13px",background:"var(--accent)",color:"var(--bg)",border:"none",borderRadius:"var(--radius)",fontWeight:700,fontSize:"14px",textTransform:"uppercase",letterSpacing:".06em",cursor:"pointer",fontFamily:"inherit"}}>
            {loading?"…":"Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Photo Uploader with drag-to-reorder ──────────────────
function PhotoUploader({ images, onChange }:{ images:string[]; onChange:(imgs:string[])=>void }) {
  const [uploading,setUploading]=useState(false);
  const [dropZoneOver,setDropZoneOver]=useState(false);
  const [dragIdx,setDragIdx]=useState<number|null>(null);
  const [overIdx,setOverIdx]=useState<number|null>(null);
  const inputRef=useRef<HTMLInputElement>(null);

  const uploadFiles=async(files:FileList|File[])=>{
    setUploading(true);
    const arr=Array.from(files); const uploaded:string[]=[];
    for(let i=0;i<arr.length;i++){
      const fd=new FormData(); fd.append("file",arr[i]); fd.append("index",String(images.length+i));
      const res=await fetch("/api/admin/upload",{method:"POST",body:fd});
      const d=await res.json(); if(d.url) uploaded.push(d.url);
    }
    onChange([...images,...uploaded]); setUploading(false);
  };

  const remove=(i:number)=>onChange(images.filter((_,idx)=>idx!==i));

  // Drag to reorder
  const onDragStart=(i:number)=>setDragIdx(i);
  const onDragOver=(e:React.DragEvent,i:number)=>{ e.preventDefault(); setOverIdx(i); };
  const onDrop=(e:React.DragEvent,i:number)=>{
    e.preventDefault();
    if(dragIdx===null||dragIdx===i) return;
    const a=[...images]; const [item]=a.splice(dragIdx,1); a.splice(i,0,item);
    onChange(a); setDragIdx(null); setOverIdx(null);
  };
  const onDragEnd=()=>{ setDragIdx(null); setOverIdx(null); };

  return (
    <div>
      <div onClick={()=>inputRef.current?.click()}
        onDragOver={e=>{e.preventDefault();setDropZoneOver(true);}}
        onDragLeave={()=>setDropZoneOver(false)}
        onDrop={e=>{e.preventDefault();setDropZoneOver(false);uploadFiles(e.dataTransfer.files);}}
        style={{border:`2px dashed ${dropZoneOver?"var(--accent)":"var(--border)"}`,borderRadius:"var(--radius)",padding:"24px",textAlign:"center",cursor:"pointer",background:dropZoneOver?"rgba(154,255,58,.05)":"var(--bg3)",transition:"all .15s ease",marginBottom:"12px"}}>
        {uploading
          ?<p style={{color:"var(--accent)",fontSize:"14px"}}>⏳ Upload en cours…</p>
          :<><p style={{color:"var(--gray)",fontSize:"14px"}}>📸 Cliquez ou déposez les photos ici</p><p style={{color:"var(--gray2)",fontSize:"12px",marginTop:"4px"}}>Glissez les vignettes pour réorganiser l'ordre</p></>
        }
        <input ref={inputRef} type="file" multiple accept="image/*" style={{display:"none"}} onChange={e=>e.target.files&&uploadFiles(e.target.files)} />
      </div>

      {images.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:"8px"}}>
          {images.map((img,i)=>(
            <div key={img} draggable
              onDragStart={()=>onDragStart(i)}
              onDragOver={e=>onDragOver(e,i)}
              onDrop={e=>onDrop(e,i)}
              onDragEnd={onDragEnd}
              style={{position:"relative",borderRadius:"6px",overflow:"hidden",cursor:"grab",
                border:i===overIdx&&dragIdx!==null&&dragIdx!==i?"2px solid var(--accent)":i===0?"2px solid var(--accent)":"2px solid var(--border)",
                background:"var(--bg3)",opacity:dragIdx===i?0.4:1,transition:"opacity .15s,border .15s"}}>
              <img src={img} alt={`Photo ${i+1}`} style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",display:"block",pointerEvents:"none"}} />
              {i===0&&<div style={{position:"absolute",top:"4px",left:"4px",background:"var(--accent)",color:"var(--bg)",fontSize:"9px",fontWeight:700,padding:"2px 6px",borderRadius:"3px"}}>PRINCIPALE</div>}
              <button onClick={()=>remove(i)} style={{position:"absolute",top:"4px",right:"4px",width:"20px",height:"20px",background:"rgba(200,0,0,.85)",color:"#fff",border:"none",borderRadius:"3px",cursor:"pointer",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              <div style={{position:"absolute",bottom:"4px",left:"4px",background:"rgba(0,0,0,.65)",color:"#fff",fontSize:"10px",padding:"1px 5px",borderRadius:"3px"}}>{i+1}</div>
              <div style={{position:"absolute",bottom:"4px",right:"4px",background:"rgba(0,0,0,.5)",color:"rgba(255,255,255,.6)",fontSize:"10px",padding:"1px 5px",borderRadius:"3px"}}>⠿</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Car Form ─────────────────────────────────────────────
function CarForm({ initial, onSave, onCancel }:{ initial?:Car; onSave:(car:any)=>Promise<void>; onCancel:()=>void }) {
  const [form,setForm]=useState<any>(initial??{...empty});
  const [saving,setSaving]=useState(false);
  const [featText,setFeatText]=useState((initial?.features??[]).join(", "));
  const [equipText,setEquipText]=useState((initial?.equipments??[]).join("\n"));
  const set=(k:string,v:any)=>setForm((f:any)=>({...f,[k]:v}));
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setSaving(true);
    const features=featText.split(",").map(s=>s.trim()).filter(Boolean);
    const equipments=equipText.split("\n").map(s=>s.trim()).filter(Boolean);
    await onSave({...form,features,equipments,budget_tag:budgetTag(Number(form.price))});
    setSaving(false);
  };
  const inp={width:"100%",padding:"10px 12px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--radius)",color:"var(--white)",fontSize:"14px",fontFamily:"inherit",boxSizing:"border-box" as const};
  const lbl={fontSize:"11px",fontWeight:700,textTransform:"uppercase" as const,letterSpacing:".06em",color:"var(--gray)",display:"block",marginBottom:"5px"};
  const grp={marginBottom:"16px"};
  return (
    <form onSubmit={submit}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        <div style={{gridColumn:"1/-1",...grp}}><label style={lbl}>Photos</label><PhotoUploader images={form.images??[]} onChange={imgs=>set("images",imgs)} /></div>
        <div style={{gridColumn:"1/-1",...grp}}><label style={lbl}>Titre / Modèle *</label><input required value={form.title} onChange={e=>set("title",e.target.value)} style={inp} placeholder="Mini Cooper Hatch 136ch" /></div>
        <div style={grp}><label style={lbl}>Prix (€) *</label><input required type="number" value={form.price||""} onChange={e=>set("price",Number(e.target.value))} style={inp} placeholder="13500" /></div>
        <div style={grp}><label style={lbl}>Année *</label><input required type="number" value={form.year||""} onChange={e=>set("year",Number(e.target.value))} style={inp} placeholder="2019" /></div>
        <div style={grp}><label style={lbl}>Kilométrage *</label><input required type="number" value={form.km||""} onChange={e=>set("km",Number(e.target.value))} style={inp} placeholder="80000" /></div>
        <div style={grp}><label style={lbl}>Carburant *</label>
          <select required value={form.fuel} onChange={e=>set("fuel",e.target.value)} style={{...inp,appearance:"none"}}>
            <option>Essence</option><option>Diesel</option><option>Hybride</option><option>Électrique</option>
          </select>
        </div>
        <div style={grp}><label style={lbl}>Boîte *</label>
          <select required value={form.gearbox} onChange={e=>set("gearbox",e.target.value)} style={{...inp,appearance:"none"}}>
            <option>Manuelle</option><option>Automatique</option>
          </select>
        </div>
        <div style={grp}><label style={lbl}>Couleur</label><input value={form.color??""} onChange={e=>set("color",e.target.value)} style={inp} placeholder="Beige" /></div>
        <div style={grp}><label style={lbl}>Puissance (ch)</label><input type="number" value={form.power_din??""} onChange={e=>set("power_din",e.target.value?Number(e.target.value):null)} style={inp} placeholder="136" /></div>
        <div style={grp}><label style={lbl}>Portes</label><input type="number" value={form.doors??""} onChange={e=>set("doors",e.target.value?Number(e.target.value):null)} style={inp} placeholder="5" /></div>
        <div style={grp}><label style={lbl}>CO₂ (g/km)</label><input type="number" value={form.co2??""} onChange={e=>set("co2",e.target.value?Number(e.target.value):null)} style={inp} placeholder="120" /></div>
        <div style={grp}><label style={lbl}>Garantie</label><input value={form.guarantee??""} onChange={e=>set("guarantee",e.target.value)} style={inp} placeholder="3 mois" /></div>
        <div style={grp}><label style={lbl}>Statut</label>
          <select value={form.status} onChange={e=>set("status",e.target.value)} style={{...inp,appearance:"none"}}>
            <option value="available">✅ Disponible</option>
            <option value="reserved">🟡 Réservé</option>
            <option value="sold">❌ Vendu</option>
          </select>
        </div>
        <div style={{gridColumn:"1/-1",...grp}}><label style={lbl}>Description</label><textarea value={form.description??""} onChange={e=>set("description",e.target.value)} style={{...inp,minHeight:"90px",resize:"vertical"}} placeholder="Très bel état général…" /></div>
        <div style={{gridColumn:"1/-1",...grp}}><label style={lbl}>Caractéristiques (séparées par virgules)</label><input value={featText} onChange={e=>setFeatText(e.target.value)} style={inp} placeholder="CT OK, Garantie 3 mois, Révision complète" /></div>
        <div style={{gridColumn:"1/-1",...grp}}><label style={lbl}>Équipements (un par ligne)</label><textarea value={equipText} onChange={e=>setEquipText(e.target.value)} style={{...inp,minHeight:"100px",resize:"vertical"}} placeholder={"Climatisation automatique\nGPS intégré\nBluetooth"} /></div>
      </div>
      <div style={{display:"flex",gap:"10px",marginTop:"8px"}}>
        <button type="submit" disabled={saving} style={{flex:1,padding:"13px",background:"var(--accent)",color:"var(--bg)",border:"none",borderRadius:"var(--radius)",fontWeight:700,fontSize:"14px",textTransform:"uppercase",letterSpacing:".06em",cursor:saving?"wait":"pointer",fontFamily:"inherit"}}>
          {saving?"Enregistrement…":initial?"💾 Enregistrer":"🚗 Publier la voiture"}
        </button>
        <button type="button" onClick={onCancel} style={{padding:"13px 20px",background:"var(--bg3)",color:"var(--gray)",border:"1px solid var(--border)",borderRadius:"var(--radius)",fontWeight:600,fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
      </div>
    </form>
  );
}

// ── Main Admin ────────────────────────────────────────────
export default function AdminPage() {
  const [authed,setAuthed]=useState(false);
  const [cars,setCars]=useState<Car[]>([]);
  const [view,setView]=useState<"list"|"add"|"edit">("list");
  const [editing,setEditing]=useState<Car|null>(null);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [deleting,setDeleting]=useState<string|null>(null);
  const [msg,setMsg]=useState("");
  const [dragCarIdx,setDragCarIdx]=useState<number|null>(null);
  const [overCarIdx,setOverCarIdx]=useState<number|null>(null);
  const [orderChanged,setOrderChanged]=useState(false);

  const loadCars=useCallback(async()=>{
    setLoading(true);
    const{data}=await sb.from("cars").select("*").order("sort_order",{ascending:true,nullsFirst:false}).order("added_at",{ascending:false});
    setCars(data??[]); setLoading(false); setOrderChanged(false);
  },[]);

  useEffect(()=>{ if(authed) loadCars(); },[authed,loadCars]);

  const flash=(m:string)=>{ setMsg(m); setTimeout(()=>setMsg(""),3000); };

  const handleAdd=async(form:any)=>{
    const id=slugify(form.title,form.year);
    const{error}=await sb.from("cars").insert({...form,id,sort_order:cars.length,added_at:new Date().toISOString()});
    if(error){flash("❌ Erreur: "+error.message);return;}
    flash("✅ Voiture publiée !"); setView("list"); loadCars();
  };

  const handleEdit=async(form:any)=>{
    const{error}=await sb.from("cars").update(form).eq("id",editing!.id);
    if(error){flash("❌ Erreur: "+error.message);return;}
    flash("✅ Modifié !"); setView("list"); setEditing(null); loadCars();
  };

  const handleStatus=async(id:string,status:string)=>{
    await sb.from("cars").update({status}).eq("id",id);
    setCars(cs=>cs.map(c=>c.id===id?{...c,status}:c));
  };

  const handleDelete=async(id:string)=>{
    if(deleting!==id){setDeleting(id);return;}
    await sb.from("cars").delete().eq("id",id);
    setCars(cs=>cs.filter(c=>c.id!==id)); setDeleting(null); flash("🗑️ Supprimée");
  };

  // ── Car drag-to-reorder ──────────────────────────────
  const onCarDragStart=(i:number)=>setDragCarIdx(i);
  const onCarDragOver=(e:React.DragEvent,i:number)=>{ e.preventDefault(); setOverCarIdx(i); };
  const onCarDrop=(e:React.DragEvent,i:number)=>{
    e.preventDefault();
    if(dragCarIdx===null||dragCarIdx===i){setDragCarIdx(null);setOverCarIdx(null);return;}
    const a=[...filtered]; const[item]=a.splice(dragCarIdx,1); a.splice(i,0,item);
    // Merge back into cars (non-filtered stay in place)
    const ids=new Set(filtered.map(c=>c.id));
    const others=cars.filter(c=>!ids.has(c.id));
    setCars([...a,...others]);
    setDragCarIdx(null); setOverCarIdx(null); setOrderChanged(true);
  };
  const onCarDragEnd=()=>{ setDragCarIdx(null); setOverCarIdx(null); };

  const saveOrder=async()=>{
    const updates=filtered.map((c,i)=>sb.from("cars").update({sort_order:i}).eq("id",c.id));
    await Promise.all(updates);
    flash("✅ Ordre sauvegardé !"); setOrderChanged(false);
  };

  const filtered=cars.filter(c=>!search||c.title?.toLowerCase().includes(search.toLowerCase()));

  const statusCounts={
    available:cars.filter(c=>c.status==="available").length,
    reserved:cars.filter(c=>c.status==="reserved").length,
    sold:cars.filter(c=>c.status==="sold").length,
  };

  if(!authed) return <LoginScreen onLogin={()=>setAuthed(true)} />;

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--white)"}}>
      {/* Header */}
      <div style={{background:"var(--bg2)",borderBottom:"3px solid var(--accent)",padding:"0 24px"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:"32px",height:"32px",background:"var(--accent)",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"var(--bg)",fontFamily:"var(--font-head)",fontSize:"18px"}}>A</div>
            <span style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"18px",textTransform:"uppercase"}}>Admin</span>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            {view!=="list"&&<button onClick={()=>{setView("list");setEditing(null);}} style={{padding:"7px 14px",background:"var(--bg3)",color:"var(--gray)",border:"1px solid var(--border)",borderRadius:"var(--radius)",fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>← Stock</button>}
            {view==="list"&&<button onClick={()=>setView("add")} style={{padding:"7px 16px",background:"var(--accent)",color:"var(--bg)",border:"none",borderRadius:"var(--radius)",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Ajouter</button>}
            <a href="/" target="_blank" style={{padding:"7px 14px",background:"var(--bg3)",color:"var(--gray)",border:"1px solid var(--border)",borderRadius:"var(--radius)",fontSize:"13px",textDecoration:"none",fontFamily:"inherit"}}>🌐 Site</a>
          </div>
        </div>
      </div>

      {msg&&<div style={{background:msg.startsWith("❌")?"rgba(255,68,68,.15)":"rgba(154,255,58,.15)",border:`1px solid ${msg.startsWith("❌")?"#ff4444":"var(--accent)"}`,color:msg.startsWith("❌")?"#ff4444":"var(--accent)",padding:"10px 24px",textAlign:"center",fontSize:"14px",fontWeight:600}}>{msg}</div>}

      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"24px"}}>

        {view==="add"&&(
          <div>
            <h2 style={{fontFamily:"var(--font-head)",fontSize:"22px",fontWeight:700,textTransform:"uppercase",marginBottom:"24px",color:"var(--white)"}}>Ajouter une voiture</h2>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"28px"}}>
              <CarForm onSave={handleAdd} onCancel={()=>setView("list")} />
            </div>
          </div>
        )}

        {view==="edit"&&editing&&(
          <div>
            <h2 style={{fontFamily:"var(--font-head)",fontSize:"22px",fontWeight:700,textTransform:"uppercase",marginBottom:"24px",color:"var(--white)"}}>Modifier — {editing.title}</h2>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"28px"}}>
              <CarForm initial={editing} onSave={handleEdit} onCancel={()=>{setView("list");setEditing(null);}} />
            </div>
          </div>
        )}

        {view==="list"&&(
          <>
            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"24px"}}>
              {[["✅ Disponibles",statusCounts.available,"var(--accent)"],["🟡 Réservées",statusCounts.reserved,"#f59e0b"],["❌ Vendues",statusCounts.sold,"var(--gray)"]].map(([l,c,col])=>(
                <div key={l as string} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"16px 20px"}}>
                  <div style={{fontFamily:"var(--font-head)",fontSize:"28px",fontWeight:700,color:col as string,lineHeight:1}}>{c as number}</div>
                  <div style={{fontSize:"12px",color:"var(--gray)",marginTop:"4px",textTransform:"uppercase",letterSpacing:".06em"}}>{l as string}</div>
                </div>
              ))}
            </div>

            {/* Search + order bar */}
            <div style={{display:"flex",gap:"10px",marginBottom:"16px",alignItems:"center"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher…"
                style={{flex:1,padding:"10px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",color:"var(--white)",fontSize:"14px",fontFamily:"inherit",outline:"none"}} />
              {orderChanged&&(
                <button onClick={saveOrder} style={{padding:"10px 18px",background:"var(--accent)",color:"var(--bg)",border:"none",borderRadius:"var(--radius)",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                  💾 Sauvegarder l&apos;ordre
                </button>
              )}
            </div>

            {orderChanged&&(
              <div style={{background:"rgba(154,255,58,.08)",border:"1px solid rgba(154,255,58,.2)",borderRadius:"var(--radius)",padding:"10px 16px",marginBottom:"12px",fontSize:"13px",color:"var(--accent)"}}>
                ⠿ Glissez les lignes pour réorganiser · Cliquez <strong>Sauvegarder l&apos;ordre</strong> pour appliquer
              </div>
            )}

            {!orderChanged&&!search&&(
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"10px 16px",marginBottom:"12px",fontSize:"12px",color:"var(--gray2)"}}>
                ⠿ Glissez les lignes pour changer l&apos;ordre d&apos;affichage sur le site
              </div>
            )}

            {/* Car list */}
            {loading?(
              <div style={{textAlign:"center",padding:"60px",color:"var(--gray)"}}>Chargement…</div>
            ):filtered.length===0?(
              <div style={{textAlign:"center",padding:"60px",color:"var(--gray)"}}>Aucune voiture</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                {filtered.map((car,i)=>(
                  <div key={car.id} draggable
                    onDragStart={()=>onCarDragStart(i)}
                    onDragOver={e=>onCarDragOver(e,i)}
                    onDrop={e=>onCarDrop(e,i)}
                    onDragEnd={onCarDragEnd}
                    style={{
                      background:"var(--bg2)",border:"1px solid var(--border)",
                      borderRadius:"var(--radius)",padding:"12px 14px",
                      display:"flex",alignItems:"center",gap:"12px",
                      cursor:"grab",
                      borderLeft:overCarIdx===i&&dragCarIdx!==null&&dragCarIdx!==i?"3px solid var(--accent)":"1px solid var(--border)",
                      opacity:dragCarIdx===i?0.4:1,
                      transition:"opacity .15s,border .1s",
                    }}>

                    {/* Drag handle */}
                    <div style={{color:"var(--gray2)",fontSize:"18px",flexShrink:0,userSelect:"none",cursor:"grab"}}>⠿</div>

                    {/* Thumbnail */}
                    <div style={{width:"64px",height:"48px",borderRadius:"5px",overflow:"hidden",background:"var(--bg3)",flexShrink:0}}>
                      {car.images?.[0]
                        ?<img src={car.images[0]} alt={car.title} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                        :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>🚗</div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:600,fontSize:"14px",color:"var(--white)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{car.title}</p>
                      <p style={{fontSize:"12px",color:"var(--gray)",marginTop:"2px"}}>
                        {car.price?.toLocaleString("fr-FR")} € · {car.km?.toLocaleString("fr-FR")} km · {car.year} · {car.fuel}
                      </p>
                    </div>

                    {/* Status */}
                    <select value={car.status} onChange={e=>handleStatus(car.id,e.target.value)}
                      style={{padding:"6px 10px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--radius)",
                        color:car.status==="available"?"var(--accent)":car.status==="reserved"?"#f59e0b":"var(--gray)",
                        fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",appearance:"none",flexShrink:0}}>
                      <option value="available">✅ Disponible</option>
                      <option value="reserved">🟡 Réservé</option>
                      <option value="sold">❌ Vendu</option>
                    </select>

                    {/* Actions */}
                    <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                      <button onClick={()=>{setEditing(car);setView("edit");}}
                        style={{padding:"6px 11px",background:"var(--bg3)",color:"var(--white)",border:"1px solid var(--border)",borderRadius:"var(--radius)",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                        ✏️
                      </button>
                      <a href={`/car/${car.id}`} target="_blank"
                        style={{padding:"6px 11px",background:"var(--bg3)",color:"var(--gray)",border:"1px solid var(--border)",borderRadius:"var(--radius)",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",textDecoration:"none"}}>
                        👁
                      </a>
                      <button onClick={()=>handleDelete(car.id)}
                        style={{padding:"6px 11px",background:deleting===car.id?"#ff4444":"var(--bg3)",color:deleting===car.id?"#fff":"#ff4444",border:`1px solid ${deleting===car.id?"#ff4444":"var(--border)"}`,borderRadius:"var(--radius)",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                        {deleting===car.id?"✓":"🗑"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
