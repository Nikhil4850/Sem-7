using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/settings")]
[Produces("application/json")]
[Authorize(Roles = "administrator")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settings;

    public SettingsController(ISettingsService settings) => _settings = settings;

    /// <summary>Get a specific setting by key.</summary>
    [HttpGet("{key}")]
    [ProducesResponseType(typeof(SettingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(string key)
    {
        var setting = await _settings.GetSettingAsync(key);
        return setting is null ? NotFound(new { message = $"Setting '{key}' not found." }) : Ok(setting);
    }

    /// <summary>Create or update a setting.</summary>
    [HttpPut("{key}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Save(string key, [FromBody] SaveSettingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, message) = await _settings.SaveSettingAsync(key, request);
        if (!success)
            return BadRequest(new { message });

        return Ok(new { message });
    }

    /// <summary>Get all settings.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SettingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() =>
        Ok(await _settings.GetAllSettingsAsync());

    /// <summary>Delete a setting.</summary>
    [HttpDelete("{key}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string key)
    {
        var (success, message) = await _settings.DeleteSettingAsync(key);
        if (!success)
            return message.Contains("not found") ? NotFound(new { message }) : BadRequest(new { message });

        return Ok(new { message });
    }
}
