import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { buildUnitQrCodeUrl } from '../lib/productIdentity';

function VerifyProductPage({ products = [] }) {
  const { unitId } = useParams();
  const location = useLocation();
  const queryCode = new URLSearchParams(location.search).get('code') || '';

  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState(null);
  const [unitError, setUnitError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadUnit = async () => {
      setLoading(true);
      setUnitError('');

      try {
        const { data, error } = await supabase
          .from('product_auth_units')
          .select('*')
          .eq('public_unit_id', unitId)
          .maybeSingle();

        if (error) throw error;

        if (!cancelled) {
          setUnit(data || null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading authenticity unit:', error.message);
          setUnit(null);
          setUnitError(error.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (unitId) {
      loadUnit();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [unitId]);

  const product = useMemo(() => {
    if (!unit?.product_id) return null;
    return products.find((entry) => entry.id === unit.product_id) || null;
  }, [products, unit]);

  const verified = Boolean(
    unit
      && queryCode
      && queryCode === unit.authenticity_code
      && unit.status !== 'archived',
  );
  const qrCodeUrl = unit ? buildUnitQrCodeUrl(unit) : '';

  if (loading) {
    return (
      <div className="page-stack">
        <section className="page-header-panel">
          <p className="label">Product Verification</p>
          <h1>Checking authenticity record...</h1>
          <p className="hero-text">Please wait while we verify this CHRONYX certificate.</p>
        </section>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="page-stack">
        <SEO
          title="Verify CHRONYX Product"
          description="Check whether a CHRONYX authenticity certificate is valid."
          path={`/verify/unit/${unitId || ''}`}
        />
        <section className="page-header-panel">
          <p className="label">Product Verification</p>
          <h1>Certificate not found.</h1>
          <p className="hero-text">
            {unitError
              ? 'The authenticity registry is not fully configured yet. Please contact CHRONYX support if you expected this certificate to be active.'
              : 'The scanned certificate could not be matched with an active CHRONYX authenticity record.'}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <SEO
        title={`Verify ${unit.public_unit_id}`}
        description={`Verify CHRONYX authenticity certificate ${unit.public_unit_id}.`}
        path={`/verify/unit/${unit.public_unit_id}`}
      />

      <section className="page-header-panel">
        <p className="label">Product Verification</p>
        <h1>{verified ? 'Authenticity confirmed.' : 'Authenticity check incomplete.'}</h1>
        <p className="hero-text">
          {verified
            ? 'This certificate matches an active CHRONYX registry entry and can be treated as authentic.'
            : 'The scanned code does not match the active authenticity record for this unit. Please contact CHRONYX if this certificate came with your order.'}
        </p>
      </section>

      <section className="checkout-layout">
        <div className="checkout-form-panel product-auth-verify-panel">
          <div className="section-heading">
            <h2>{product?.name || 'CHRONYX Registered Unit'}</h2>
            <p className="hero-text">
              {product?.summary || 'A registered CHRONYX certificate tied to an individual physical unit.'}
            </p>
          </div>
          <div className="product-auth-verify-grid">
            <div className="product-auth-item">
              <small>Unit ID</small>
              <strong>{unit.public_unit_id}</strong>
            </div>
            <div className="product-auth-item">
              <small>Authenticity Code</small>
              <strong>{unit.authenticity_code}</strong>
            </div>
            <div className="product-auth-item">
              <small>Status</small>
              <strong>{verified ? 'Verified authentic' : unit.status === 'archived' ? 'Archived certificate' : 'Code mismatch'}</strong>
            </div>
            <div className="product-auth-item">
              <small>Issued Unit</small>
              <strong>Certificate #{unit.serial_number}</strong>
            </div>
          </div>
          {product ? (
            <Link to={`/products/${product.id}`} className="primary-btn">
              View Product
            </Link>
          ) : null}
        </div>

        <div className="summary-panel product-auth-qr-panel">
          <h3>Certificate QR</h3>
          <img src={qrCodeUrl} alt={`Verification QR for ${unit.public_unit_id}`} />
        </div>
      </section>
    </div>
  );
}

export default VerifyProductPage;
