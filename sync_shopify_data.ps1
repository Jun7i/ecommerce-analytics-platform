# Shopify Data Sync Script
# Run this whenever you make changes to your Shopify store

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SHOPIFY DATA SYNC UTILITY" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Syncing your Shopify store data..." -ForegroundColor Yellow
Write-Host "This will update both your local and Vercel databases." -ForegroundColor Gray
Write-Host ""

# Change to ETL directory
Set-Location "d:\Coding\shopify\etl"

# Run the sync script
try {
    python sync_all_data.py
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SYNC COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your data has been updated! 🎉" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "• Local frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "• Vercel deployment will automatically show updated data" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR OCCURRED:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "• Your .env file has correct Shopify credentials" -ForegroundColor Gray
    Write-Host "• Your database connection is working" -ForegroundColor Gray
    Write-Host "• Your internet connection is stable" -ForegroundColor Gray
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")