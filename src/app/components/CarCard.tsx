import Link from "next/link";
export default function CarCard({ car }: { car: any }) {
  const isSold=car.status==="sold", isReserved=car.status==="reserved";
  return (
    <Link href={isSold?"#":`/car/${car.id}`} className="car-card" style={isSold?{pointerEvents:"none",opacity:.5}:{}}>
      <div className="car-card-img">
        {car.images?.[0] ? <img src={car.images[0]} alt={car.title} loading="lazy" /> : (
          <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#1a1a1a",gap:"10px"}}>
            <svg width="90" height="56" viewBox="0 0 90 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 32 C8 32 10 20 20 18 L28 10 C30 8 34 7 40 7 L58 7 C64 7 68 9 70 12 L76 18 C82 20 84 26 84 32 L84 38 C84 40 82 42 80 42 L10 42 C8 42 6 40 6 38 Z" fill="#252525" stroke="#333" strokeWidth="1.5"/>
              <path d="M28 10 L30 18 L62 18 L60 10 Z" fill="#1e2e1e" stroke="#2a3a2a" strokeWidth="1"/>
              <path d="M32 10 L33 17 L44 17 L44 10 Z" fill="#1a281a"/>
              <path d="M46 10 L46 17 L58 17 L57 10 Z" fill="#1a281a"/>
              <circle cx="22" cy="42" r="8" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
              <circle cx="22" cy="42" r="4" fill="#252525"/>
              <circle cx="68" cy="42" r="8" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
              <circle cx="68" cy="42" r="4" fill="#252525"/>
              <path d="M6 32 L84 32" stroke="#2a2a2a" strokeWidth="1"/>
              <rect x="74" y="24" width="8" height="5" rx="1" fill="#2a3a2a"/>
              <rect x="8" y="24" width="6" height="4" rx="1" fill="#9aff3a" opacity="0.3"/>
              <rect x="75" y="28" width="6" height="3" rx="1" fill="#ff4444" opacity="0.3"/>
            </svg>
            <span style={{fontSize:"11px",color:"#444",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"}}>Photo à venir</span>
          </div>
        )}
        <div className="car-badge-wrap">
          {isReserved && (
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:2}}>
              <div style={{color:"#f59e0b",border:"2px solid #f59e0b",fontWeight:900,fontSize:"16px",letterSpacing:".14em",padding:"8px 24px",fontFamily:"var(--font-head)"}}>RÉSERVÉ</div>
            </div>
          )}
          {isSold && (
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:2}}>
              <div style={{color:"#888",border:"2px solid #888",fontWeight:900,fontSize:"16px",letterSpacing:".14em",padding:"8px 24px",fontFamily:"var(--font-head)"}}>VENDU</div>
            </div>
          )}
        </div>
      </div>
      <div className="car-card-body">
        <p className="car-make">{car.fuel} · {car.gearbox}{car.color?` · ${car.color}`:""}</p>
        <p className="car-title">{car.title}</p>
        <p className="car-specs"><span>{car.year}</span>&nbsp;·&nbsp;<span>{car.km?.toLocaleString("fr-FR")} km</span>{car.power_din?<>&nbsp;·&nbsp;<span>{car.power_din} ch</span></>:null}</p>
        <div className="car-features">{(car.features??[]).slice(0,3).map((f:string)=><span key={f} className="car-feat">{f}</span>)}</div>
        <p className="car-price">{car.price?.toLocaleString("fr-FR")} € <span className="car-price-ttc">TTC</span></p>
      </div>
      <div className="car-card-footer">
        <div className="btn btn-accent btn-full" style={{fontSize:"12px",padding:"10px"}}>Voir ce véhicule →</div>
      </div>
    </Link>
  );
}
