
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkInventory() {
    console.log('Checking inventory...');
    
    // Check Subcategories
    const { count: subCount, error: subError } = await supabase
        .from('Subcategory')
        .select('*', { count: 'exact', head: true });
        
    if (subError) console.error('Subcategory Error:', subError);
    console.log('Total Subcategories:', subCount);

    // Check AssetUnits
    const { count: unitCount, error: unitError } = await supabase
        .from('AssetUnit')
        .select('*', { count: 'exact', head: true });

    if (unitError) console.error('AssetUnit Error:', unitError);
    console.log('Total AssetUnits:', unitCount);

    // Check Available AssetUnits
    const { count: availCount, error: availError } = await supabase
        .from('AssetUnit')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'AVAILABLE');

    if (availError) console.error('Available Error:', availError);
    console.log('Total Available AssetUnits:', availCount);
    
    // Check items with available stock via join AND category join (simulating the API query exactly)
    const { data, error } = await supabase
        .from('Subcategory')
        .select('id, title, category:Category!inner(name), units:AssetUnit(count)')
        .eq('units.status', 'AVAILABLE');
        
    if (error) console.log('Exact API Query Error:', error);
    console.log('Subcategories found with EXACT API query:', data?.length);
    if (data && data.length > 0) {
        console.log('Sample Data:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('No data found with exact query.');
    }
}

checkInventory();
